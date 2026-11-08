import { useCallback, useEffect, useRef, useState } from "react";
import { campaignService } from "../Services/campaign.service";

const EMPTY_COUNTS = { all: 0, draft: 0, active: 0, completed: 0 };

/**
 * State + actions for the campaigns list page: filter tabs, paging, duplicate and delete.
 * The page only renders what this hook returns.
 */
export default function useCampaigns({ initialNotice = "" } = {}) {
  const [filter, setFilter] = useState("all");
  const [campaigns, setCampaigns] = useState([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true); // first load / filter change
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState(null); // campaign being duplicated / deleted
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(initialNotice);
  const latestRequest = useRef(0);

  /** Fetch one page. `silent` refreshes without showing the loading skeleton. */
  const load = useCallback(async (status, nextPage = 1, { silent = false } = {}) => {
    const requestId = ++latestRequest.current;
    if (nextPage > 1) setLoadingMore(true);
    else if (!silent) setLoading(true);
    setError("");

    try {
      const data = await campaignService.list({ status, page: nextPage });
      if (requestId !== latestRequest.current) return; // a newer request replaced this one
      setCampaigns((previous) => (nextPage === 1 ? data.campaigns : [...previous, ...data.campaigns]));
      setCounts(data.counts);
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
    load(filter, 1);
  }, [filter, load]);

  const changeFilter = (key) => {
    setNotice("");
    setFilter(key);
  };

  const loadMore = () => load(filter, page + 1);

  /** Run a server action on one campaign, then refresh the list. */
  const runOnCampaign = async (id, action, successMessage) => {
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      await action(id);
      setNotice(successMessage);
      await load(filter, 1, { silent: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = (id) => runOnCampaign(id, campaignService.remove, "Campaign deleted.");
  const duplicate = (id) =>
    runOnCampaign(id, campaignService.duplicate, "Campaign duplicated as a draft.");

  return {
    filter,
    campaigns,
    counts,
    hasMore: page < pages,
    loading,
    loadingMore,
    busyId,
    error,
    notice,
    changeFilter,
    loadMore,
    remove,
    duplicate,
  };
}
