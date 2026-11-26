import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, MapPin, Plus, Search, X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Button from "../../../Shared_Components/Button";
import { CAMPAIGN_LIMITS } from "../campaignConfig";
import { INITIAL_AREAS } from "../campaignLocationSuggestions";
import "./CampaignLocationPicker.css";

const PAKISTAN_BOUNDS = L.latLngBounds([23.6, 60.8], [37.2, 77.9]);
const GEOCODER = (import.meta.env.VITE_CAMPAIGN_GEOCODER_URL || "https://photon.komoot.io").replace(/\/$/, "");
const AREA_LAYERS = ["district", "locality"];
const BASEMAP_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const CITY_CENTERS = {
  Karachi: [24.86, 67.01], Lahore: [31.55, 74.34], Islamabad: [33.69, 73.05],
  Rawalpindi: [33.60, 73.05], Faisalabad: [31.42, 73.09], Multan: [30.20, 71.47],
  Peshawar: [34.01, 71.58], Quetta: [30.18, 66.98], Hyderabad: [25.38, 68.37],
  Sukkur: [27.71, 68.85],
};
const CITY_NAME_ALIASES = {
  "کراچی": "Karachi", "لاہور": "Lahore", "اسلام آباد": "Islamabad",
  "راولپنڈی": "Rawalpindi", "فیصل آباد": "Faisalabad", "ملتان": "Multan",
  "پشاور": "Peshawar", "کوئٹہ": "Quetta", "حیدرآباد": "Hyderabad",
  "حیدر آباد": "Hyderabad", "سکھر": "Sukkur",
};

function initialMatches(prefix, city) {
  if (!prefix) return [];
  return INITIAL_AREAS.filter((area) =>
    (!city || area.city === city) && area.label.toLowerCase().startsWith(prefix)
  );
}

function getAreas(features, cityFilter) {
  const areas = new Map();
  for (const { properties, geometry } of features) {
    if (properties?.countrycode !== "PK" || !AREA_LAYERS.includes(properties.type)) continue;
    if (!properties.name || geometry?.type !== "Point") continue;
    const [lng, lat] = geometry.coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !PAKISTAN_BOUNDS.contains([lat, lng])) continue;

    const name = properties.name;
    const addressCity = properties.city || properties.county || "";
    const city = CITY_NAME_ALIASES[addressCity] || addressCity;
    if (cityFilter && city.toLowerCase() !== cityFilter.toLowerCase()) continue;
    const label = city && city !== name ? `${name}, ${city}` : name;
    const key = label.toLowerCase();
    const isNeighbourhood = ["suburb", "neighbourhood", "quarter"].includes(properties.osm_value);
    if (!areas.has(key) || (isNeighbourhood && !areas.get(key).isNeighbourhood)) {
      areas.set(key, { key, name, city, label, lat, lng, isNeighbourhood });
    }
  }
  return [...areas.values()];
}

export default function CampaignLocationPicker({ locations, onAdd, onBack }) {
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [areas, setAreas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [tileError, setTileError] = useState(false);
  const heading = useRef(null);
  const container = useRef(null);
  const map = useRef(null);
  const request = useRef(null);
  const searchTimer = useRef(null);
  const searchInput = useRef(null);
  const cache = useRef(new Map());
  const markers = useRef(null);

  async function lookup(endpoint, params, city = "", prefix = "") {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const search = new URLSearchParams({ ...params, limit: "12", lang: "en" });
    AREA_LAYERS.forEach((layer) => search.append("layer", layer));
    const url = `${GEOCODER}/${endpoint}?${search}`;
    const cacheKey = `${url}#${city}`;

    setBusy(true);
    setMessage("");
    setSelected(null);
    const timeout = window.setTimeout(() => controller.abort("timeout"), 10000);
    try {
      let matches = cache.current.get(cacheKey);
      if (!matches) {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("Area lookup failed");
        const { features } = await response.json();
        matches = getAreas(features, city);
        cache.current.set(cacheKey, matches);
      }
      if (request.current !== controller) return;

      if (prefix.length > 0 && prefix.length < 3) {
        matches = matches.filter(({ name }) => name.toLowerCase().startsWith(prefix));
      }
      if (prefix) {
        const suggestions = new Map(matches.map((area) => [area.key, area]));
        for (const area of initialMatches(prefix, city)) {
          if (!suggestions.has(area.key)) suggestions.set(area.key, area);
        }
        matches = [...suggestions.values()];
      }
      setAreas(matches);
      if (!matches.length) {
        setMessage(city
          ? `No matching areas in ${city}. Try a nearby neighbourhood or a different spelling.`
          : "No matching areas in Pakistan. Try a neighbourhood name like Saddar, or choose a city to narrow the results.");
        return;
      }
      if (endpoint === "reverse") {
        setSelected(matches[0]);
      } else {
        map.current.fitBounds(matches.map(({ lat, lng }) => [lat, lng]), { padding: [34, 34], maxZoom: 14 });
      }
    } catch {
      if (request.current === controller) setMessage("Area search is unavailable right now. Try again.");
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    heading.current.focus({ preventScroll: true });
    const instance = L.map(container.current, {
      minZoom: 5,
      maxBounds: PAKISTAN_BOUNDS,
      maxBoundsViscosity: 1,
    }).setView([30.1, 69.2], 5);
    map.current = instance;
    markers.current = L.layerGroup().addTo(instance);

    L.tileLayer(BASEMAP_TILES, {
      attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &middot; HERE, Garmin, OpenStreetMap contributors, and the GIS user community',
      maxNativeZoom: 19,
      maxZoom: 19,
      noWrap: true,
      referrerPolicy: "strict-origin-when-cross-origin",
    })
      .on("tileerror", () => setTileError(true))
      .on("tileload", () => setTileError(false))
      .addTo(instance);

    const neighbourhoodLabels = L.layerGroup();
    for (const { name, lat, lng } of INITIAL_AREAS) {
      const label = document.createElement("span");
      label.textContent = name;
      L.tooltip({ className: "cmp-map-neighbourhood", direction: "center", opacity: 1 })
        .setLatLng([lat, lng])
        .setContent(label)
        .addTo(neighbourhoodLabels);
    }

    instance.on("zoomend", () => {
      if (instance.getZoom() >= 12) neighbourhoodLabels.addTo(instance);
      else neighbourhoodLabels.remove();
    });

    instance.on("click", ({ latlng }) => {
      if (request.current || searchTimer.current !== null) return;
      if (!PAKISTAN_BOUNDS.contains(latlng) || instance.getZoom() < 12) {
        setMessage("Zoom in to a neighbourhood or search for an area by name.");
        return;
      }
      lookup("reverse", { lat: latlng.lat.toFixed(5), lon: latlng.lng.toFixed(5), radius: "1" });
    });

    return () => {
      window.clearTimeout(searchTimer.current);
      const pending = request.current;
      request.current = null;
      pending?.abort();
      instance.remove();
    };
  }, []);

  useEffect(() => {
    const layer = markers.current;
    layer.clearLayers();
    for (const area of areas) {
      const active = area.key === selected?.key;
      const icon = L.divIcon({
        className: `cmp-map-pin${active ? " is-selected" : ""}`,
        iconSize: [26, 30],
        iconAnchor: [13, 30],
      });
      const label = document.createElement("span");
      label.textContent = area.name;
      L.marker([area.lat, area.lng], { icon, title: area.label, zIndexOffset: active ? 500 : 0 })
        .bindTooltip(label, {
          className: "cmp-map-result-label",
          direction: "top",
          offset: [0, -30],
          opacity: 1,
          permanent: active || areas.length === 1,
          pane: "popupPane",
        })
        .on("click", () => chooseArea(area))
        .addTo(layer);
    }
    if (selected) map.current.setView([selected.lat, selected.lng], Math.max(map.current.getZoom(), 14));
  }, [areas, selected]);

  const searchAreas = (value, city) => {
    searchTimer.current = null;
    const term = value.trim().replace(/^sadar\b/i, "Saddar");
    if (term.length < 2) return;
    const areaQuery = city && !term.toLowerCase().includes(city.toLowerCase())
      ? `${term}, ${city}`
      : term;
    lookup("api", { q: areaQuery, countrycode: "PK" }, city, term.toLowerCase());
  };

  const updateSearch = (value, city) => {
    window.clearTimeout(searchTimer.current);
    searchTimer.current = null;
    const pending = request.current;
    request.current = null;
    pending?.abort();
    setBusy(false);
    setAreas(initialMatches(value.trim().toLowerCase(), city));
    setSelected(null);
    setMessage("");
    if (value.trim().length >= 2) {
      searchTimer.current = window.setTimeout(() => searchAreas(value, city), 400);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (request.current) return;
    window.clearTimeout(searchTimer.current);
    searchAreas(query, cityFilter);
  };

  const chooseArea = (area) => {
    window.clearTimeout(searchTimer.current);
    searchTimer.current = null;
    const pending = request.current;
    request.current = null;
    pending?.abort();
    setBusy(false);
    setMessage("");
    setSelected(area);
  };

  const addMessage = selected && (
    locations.some((location) => location.toLowerCase() === selected.key) ? "This area is already added." :
    locations.length >= CAMPAIGN_LIMITS.locations ? `You can add up to ${CAMPAIGN_LIMITS.locations} locations.` :
    selected.label.length > CAMPAIGN_LIMITS.location ? "This area's name is too long. Select a nearby area." : ""
  );

  return (
    <section className="cmp-location-picker" aria-labelledby="campaign-location-heading">
      <header className="cmp-location-picker__header">
        <Button type="button" variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack}>
          Back to campaign
        </Button>
        <Button
          type="button"
          size="sm"
          variant="accent"
          icon={Plus}
          disabled={!selected || busy || Boolean(addMessage)}
          onClick={() => onAdd(selected.label)}
        >
          Add location
        </Button>
      </header>
      <div className="pnl-card cmp-location-picker__body">
        <div className="cmp-location-picker__sidebar">
          <h1 id="campaign-location-heading" ref={heading} tabIndex={-1}>Select an area</h1>
          <form onSubmit={handleSearch} className="cmp-location-picker__search">
            <span id="campaign-city-label">City</span>
            <details
              className="cmp-location-picker__city"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
              }}
              onKeyDown={(event) => {
                if (event.key !== "Escape" || !event.currentTarget.open) return;
                event.currentTarget.open = false;
                event.currentTarget.firstElementChild.focus();
              }}
            >
              <summary aria-labelledby="campaign-city-label campaign-city-value">
                <span id="campaign-city-value">{cityFilter || "All Pakistan"}</span>
                <ChevronDown size={16} aria-hidden="true" />
              </summary>
              <ul aria-label="Choose a city">
                {["", ...Object.keys(CITY_CENTERS)].map((city) => (
                  <li key={city}>
                    <button
                      type="button"
                      aria-pressed={city === cityFilter}
                      onClick={(event) => {
                        const menu = event.currentTarget.closest("details");
                        menu.open = false;
                        menu.firstElementChild.focus();
                        setCityFilter(city);
                        updateSearch(query, city);
                        map.current.setView(CITY_CENTERS[city] || [30.1, 69.2], city ? 12 : 5);
                      }}
                    >
                      {city || "All Pakistan"}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
            <label htmlFor="campaign-area-search">Search neighbourhoods</label>
            <div className="cmp-location-picker__search-row">
              <div className="cmp-location-picker__search-field">
                <input
                  id="campaign-area-search"
                  ref={searchInput}
                  type="text"
                  autoComplete="off"
                  value={query}
                  placeholder={cityFilter ? "e.g. Saddar" : "e.g. Saddar, Karachi"}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    updateSearch(event.target.value, cityFilter);
                  }}
                  required
                />
                {query && (
                  <button type="button" aria-label="Clear search" onClick={() => {
                    setQuery("");
                    updateSearch("", cityFilter);
                    searchInput.current.focus();
                  }}>
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
              <Button type="submit" size="sm" icon={Search} disabled={busy || query.trim().length < 2}>
                Search
              </Button>
            </div>
          </form>
          <p className="cmp-location-picker__status" role="status">
            {busy ? "Finding areas…" : message || addMessage || (selected ? `Selected: ${selected.label}` :
              areas.length ? "Select a matching neighbourhood." :
              query.trim().length === 1 ? "Keep typing to search more neighbourhoods." :
              "Search for a neighbourhood, or zoom in and click the map.")}
          </p>
          {areas.length > 0 && (
            <ul className="cmp-location-picker__results" aria-label="Matching areas">
              {areas.map((area) => (
                <li key={area.key}>
                  <button
                    type="button"
                    aria-pressed={selected?.key === area.key}
                    onClick={() => chooseArea(area)}
                  >
                    <MapPin size={17} aria-hidden="true" />
                    <span><strong>{area.name}</strong>{area.city && <small>{area.city}</small>}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="cmp-location-picker__map">
          <div ref={container} role="region" aria-label="Interactive map of Pakistan" />
          {tileError && <p role="status" className="cmp-location-picker__tile-error">Map tiles could not load. You can still use search.</p>}
        </div>
      </div>
    </section>
  );
}
 