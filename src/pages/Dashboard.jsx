import React, { useState } from "react";
import {
  CircularProgress,
  Divider,
  Typography,
  Button,
  Box,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import Grid from "@mui/material/Grid2";
import { Item } from "../components/Item";
import LoadingAutocomplete from "../components/LoadingAutocomplete";
import useFetchData from "../hooks/useFetchData";
import { fetchResultsData } from "../api/getResultsData";
import { BACKEND_API } from "../constants/constants";
import DataTable from "../components/DataTable";
import BasicTabs from "../components/BasicTabs";
import IndicatorData from "../components/IndicatorData";
import GetIndexAttributes from "../components/GetInfexAttributes";

export default function Dashboard() {
  const [selectedFilters, setSelectedFilters] = useState({
    indicator: null,
    period: null,
    segment: null,
    mainClassification: null,
  });

  const { data: indicators, loading: loadingIndicators } = useFetchData(
    BACKEND_API + "get_indicators",
    []
  );
  const { data: periods, loading: loadingPeriods } = useFetchData(
    selectedFilters.indicator
      ? BACKEND_API + `get_periods?indexId=${selectedFilters.indicator.id}`
      : null,
    [selectedFilters.indicator]
  );
  const { data: segments, loading: loadingSegments } = useFetchData(
    selectedFilters.indicator && selectedFilters.period
      ? BACKEND_API +
          `get_segments?indexId=${selectedFilters.indicator.id}&periodId=${selectedFilters.period.id}`
      : null,
    [selectedFilters.indicator, selectedFilters.period]
  );

  const { data: indexAttributes, loading: loadingIndexAttributes } =
    useFetchData(
      selectedFilters.indicator && selectedFilters.period
        ? BACKEND_API +
            `get_index_attributes?indexId=${selectedFilters.indicator.id}&periodId=${selectedFilters.period.id}`
        : null,
      [selectedFilters.indicator, selectedFilters.period]
    );

  const mainClassifications = selectedFilters.segment
    ? selectedFilters.segment.mas_names || []
    : [];
  const [loadingResults, setLoadingResults] = useState(false);
  const [results, setResults] = useState([]);

  const [value, setValue] = React.useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 8 }}>
          <BasicTabs data={results} />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Item>
            <Typography variant="h5" align="center" gutterBottom>
              Критерии для анализа
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Индикаторы */}
            <LoadingAutocomplete
              loading={loadingIndicators}
              options={indicators}
              value={selectedFilters.indicator}
              onChange={(e, newValue) =>
                setSelectedFilters({
                  indicator: newValue,
                  period: null,
                  segment: null,
                  mainClassification: null,
                })
              }
              label="Показатель"
              placeholder="Введите или выберите показатель..."
              tooltipTitle={
                selectedFilters.indicator
                  ? `${selectedFilters.indicator.name} ${selectedFilters.indicator.id}`
                  : ""
              }
            />

            {/* Периоды */}
            {selectedFilters.indicator && (
              <LoadingAutocomplete
                loading={loadingPeriods}
                options={periods}
                value={selectedFilters.period}
                onChange={(e, newValue) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    period: newValue,
                    segment: null,
                    mainClassification: null,
                  }))
                }
                label="Период"
                placeholder="Введите или выберите период..."
                tooltipTitle={
                  selectedFilters.period
                    ? `${selectedFilters.period.name} ${selectedFilters.period.id}`
                    : ""
                }
              />
            )}

            {/* Классификации */}
            {selectedFilters.indicator && selectedFilters.period && (
              <LoadingAutocomplete
                loading={loadingSegments}
                options={segments}
                value={selectedFilters.segment}
                onChange={(e, newValue) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    segment: newValue,
                    mainClassification: null,
                  }))
                }
                label="Классификация"
                placeholder="Введите или выберите классификацию..."
                tooltipTitle={
                  selectedFilters.segment
                    ? `${selectedFilters.segment.names} ${selectedFilters.segment.id}`
                    : ""
                }
              />
            )}

            {/* Главный классификатор */}
            {selectedFilters.segment &&
              selectedFilters.indicator &&
              selectedFilters.period && (
                <LoadingAutocomplete
                  loading={false}
                  options={mainClassifications}
                  value={selectedFilters.mainClassification}
                  onChange={(e, newValue) =>
                    setSelectedFilters((prev) => ({
                      ...prev,
                      mainClassification: newValue,
                    }))
                  }
                  label="Главный классификатор"
                  placeholder="Введите или выберите главный классификатор..."
                  tooltipTitle={
                    selectedFilters.mainClassification
                      ? `${selectedFilters.mainClassification.name} ${selectedFilters.mainClassification.id}`
                      : ""
                  }
                />
              )}

            <Divider sx={{ mb: 1 }} />
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                fetchResultsData(selectedFilters, setResults, setLoadingResults)
              }
              fullWidth
              disabled={
                !selectedFilters.indicator ||
                !selectedFilters.period ||
                !selectedFilters.segment ||
                !selectedFilters.mainClassification
              }
            >
              {loadingResults ? (
                <CircularProgress size={24} />
              ) : (
                "Загрузить данные"
              )}
            </Button>
          </Item>
          {
                (selectedFilters.indicator &&
                selectedFilters.period &&
                selectedFilters.segment &&
                selectedFilters.mainClassification)
              ?<IndicatorData selectedFilters={selectedFilters} />:""
              }
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Item>
            <Box sx={{ width: "100%", typography: "body1" }}>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <TabList
                    onChange={handleChange}
                    aria-label="lab API tabs example"
                  >
                    <Tab label="Данные в табличном формате" value="1" />
                    <Tab label="Информация о показателе" value="2" />
                  </TabList>
                </Box>
                <TabPanel value="1">
                  <DataTable data={results} indexAttributes={indexAttributes} />
                </TabPanel>
                <TabPanel value="2">
                  <GetIndexAttributes indexAttributes={indexAttributes} />
                </TabPanel>
              </TabContext>
            </Box>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
}
