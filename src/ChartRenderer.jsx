import React from 'react';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChartByYear from './PieChartByYear';
import DoughnutChartByYear from './DoughnutChartByYear';

const ChartRenderer = ({ chart_type, data }) => {
  switch (chart_type) {
    case 'line':
      return <LineChart data={data} />;
    case 'bar':
      return <BarChart data={data} />;
    case 'pie':
      return <PieChartByYear data={data} />;
    case 'doughnut':
      return <DoughnutChartByYear data={data} />;
    default:
      return <div>Пожалуйста, выберите тип графика</div>;
  }
};

export default ChartRenderer;
