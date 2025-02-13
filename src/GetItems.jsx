import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { BACKEND_API } from "./constants/constants";
import DataTable from "./DrilldownChart";

const GetItems = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(BACKEND_API + "get-data", {
          credentials: "include", // обязательно для отправки cookie
        });
        if (!response.ok) {
          throw new Error("Ошибка при получении данных");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Ошибка получения данных:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${BACKEND_API}delete-data/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Ошибка при удалении данных");
      }
      // Обновляем состояние, исключая удалённый элемент
      setData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Typography variant="h6" align="center" mt={4}>
        Нет данных для отображения
      </Typography>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {data.map((item) => (
        <Grid item xs={12} sm={6} md={12} key={item.id}>
          <Card>
            <CardContent sx={{justifyContent:"right"}}>
                <IconButton onClick={() => handleDelete(item.id)}>
                  <DeleteIcon />
                </IconButton>

              <DataTable
                queryParams={{
                  p_index_id: item.p_index_id,
                  p_period_id: item.p_period_id,
                  p_terms: item.p_terms,
                  p_term_id: item.p_term_id,
                  p_dicIds: item.p_dicIds,
                  idx: item.idx,
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default GetItems;
