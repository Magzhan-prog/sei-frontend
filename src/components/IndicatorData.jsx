import React from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from '@mui/material/Button';
const IndicatorData = ({ selectedFilters }) => {
  return (
    <>
      <Card sx={{ marginTop: 1 }}>
        <CardContent>
          {selectedFilters.indicator.id}<br></br>
          {selectedFilters.indicator.id}<br></br>
          {selectedFilters.period.id}<br></br>
          {selectedFilters.segment.termIds}<br></br>
          {selectedFilters.mainClassification.id}<br></br>
          {selectedFilters.segment.dicId}<br></br>
          {selectedFilters.segment.idx}<br></br>
          <Button size="small">Сохранить выбранный критерий</Button>
        </CardContent>
      </Card>
    </>
  );
};

export default IndicatorData;
