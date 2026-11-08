import { useCallback, useEffect, useRef, useState } from "react";
import { serviceListingService } from "../Services/serviceListing.service";

/**
 * State + actions for the "My Services" list page: paging, pause / resume, duplicate and delete.
 * The page only renders what this hook returns.
 */
export default function useServiceListings({ initialNotice = "" } = {}) {
  const [services, setServices] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true); // first load
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState(null); // service being changed
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(initialNotice);
  const latestRequest = useRef(0);

  /** Fetch one page. `silent` refreshes without showing the loading skeleton. */
  const load = useCallback(async (nextPage = 1, { silent = false } = {}) => {
    const requestId = ++latestRequest.current;
    if (nextPage > 1) setLoadingMore(true);
    else if (!silent) setLoading(true);
    setError("");

    try {
      const data = await serviceListingService.list({ page: nextPage });
      if (requestId !== latestRequest.current) return; // a newer request replaced this one
      setServices((previous) => (nextPage === 1 ? data.services : [...previous, ...data.services]));
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      if (requestId === latestRequest.current) setError(err.message);
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const loadMore = () => load(page + 1);

  /** Run a server action on one service, then refresh the list. */
  const runOnService = async (action, successMessage) => {
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(successMessage);
      await load(1, { silent: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = (id) => {
    setBusyId(id);
    return runOnService(() => serviceListingService.remove(id), "Service deleted.");
  };
  const duplicate = (id) => {
    setBusyId(id);
    return runOnService(() => serviceListingService.duplicate(id), "Service duplicated as a draft.");
  };
  /** Pause an active service, or resume a paused one. */
  const toggleMatching = (service) => {
    const next = service.status === "active" ? "paused" : "active";
    setBusyId(service.id);
    return runOnService(
      () => serviceListingService.setStatus(service.id, next),
      next === "paused" ? "Matching paused." : "Matching resumed."
    );
  };

  return { services, hasMore: page < pages, loading, loadingMore, busyId, error, notice, loadMore, remove, duplicate, toggleMatching };
}
