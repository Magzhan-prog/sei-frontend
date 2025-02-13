import axios from "axios";
import { BACKEND_API } from "../constants/constants";

export const fetchResultsData = async (filters, setResults, setLoading) => {
  if (
    !filters.indicator ||
    !filters.period ||
    !filters.segment ||
    !filters.mainClassification
  )
    return;

  setLoading(true);
  try {
    const response = await axios.get(`${BACKEND_API}get_index_tree_data`, {
      params: {
        p_measure_id: 1,
        p_index_id: filters.indicator.id,
        p_period_id: filters.period.id,
        p_terms: filters.segment.termIds,
        p_term_id: filters.mainClassification.id,
        p_dicIds: filters.segment.dicId,
        idx: filters.segment.idx,
        p_parent_id: "",
      },
    });
    setResults(response.data);
  } catch (error) {
    console.error("Error fetching results data:", error);
  } finally {
    setLoading(false);
  }
};
