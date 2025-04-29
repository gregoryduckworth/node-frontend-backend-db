import { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { getProductById, updateProduct } from "../api/product";
import { refreshToken } from "../api/auth";

const EditProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const fetchTokenAndProduct = async () => {
      await fetchToken();
      await fetchProduct();
    };
    fetchTokenAndProduct();
  }, []);

  const fetchToken = async () => {
    try {
      const data = await refreshToken();
      setToken(data.accessToken);
      const decoded = jwt_decode(data.accessToken);
      setExpire(decoded.exp);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await getProductById(params.userId, params.productId);
      setName(response.data.name);
      setPrice(response.data.price);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(params.userId, params.productId, name, price, token);
      navigate(`/dashboard/${params.userId}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          boxShadow: 3,
          p: 4,
          mt: 10,
          borderRadius: "16px",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          Edit product
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            required
            label="Product name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
          />
          <TextField
            required
            label="Price"
            type="number"
            fullWidth
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            margin="normal"
          />
          <Stack direction="row" spacing={4} mt={2}>
            <Button
              onClick={() => navigate(`/dashboard/${params.userId}`)}
              variant="contained"
              color="error"
              fullWidth
              sx={{
                mt: 3,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="success"
              fullWidth
              sx={{
                mt: 3,
              }}
            >
              Update
            </Button>
          </Stack>
        </form>
      </Box>
    </Container>
  );
};

export default EditProduct;
