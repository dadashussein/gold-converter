import { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import {
  Button,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { JSX } from "@emotion/react/jsx-runtime";

interface GoldApiResponse {
  price: number;
}

export default function GoldExchangeApp(): JSX.Element {
  const [goldPriceUSD, setGoldPriceUSD] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [karat, setKarat] = useState<number>(24);
  const [convertedPrice, setConvertedPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currency, setCurrency] = useState("AZN");
  const [selectedDate, setSelectedDate] = useState<string>("2025-04-01");

  const [usdToAznRate, setUsdToAznRate] = useState<number>(1.7); // Hardcoded but could be fetched
  const [usdToTryRate, setUsdToTryRate] = useState<number>(null);

  const fetchInitialData = async (date: string): Promise<void> => {
    setLoading(true);
    try {
      const [goldResponse, forexResponse] = await Promise.all([
        axios.get<GoldApiResponse>(
          `https://www.goldapi.io/api/XAU/USD/${date}`,
          {
            headers: {
              "x-access-token": "goldapi-17u0bism9tjxq17-io",
              "Content-Type": "application/json",
            },
          }
        ),
        axios.get(
          "https://api.fastforex.io/fetch-multi?from=USD&to=TRY&api_key=40924545ce-7de893c06b-svw4um"
        ),
      ]);

      const pricePerOunceUSD = goldResponse.data.price;
      const pricePerGramUSD = pricePerOunceUSD / 31.1035;
      setGoldPriceUSD(pricePerGramUSD);

      setUsdToTryRate(forexResponse.data.results.TRY);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConvertedGoldPrice = (): number => {
    if (!goldPriceUSD) return 0;
    if (currency === "USD") return goldPriceUSD;
    if (currency === "AZN") return goldPriceUSD * usdToAznRate;
    if (currency === "TRY" && usdToTryRate) return goldPriceUSD * usdToTryRate;
    return goldPriceUSD; // fallback
  };

  useEffect(() => {
    fetchInitialData(selectedDate);
  }, [selectedDate]);

  const handleConvert = (): void => {
    const basePrice = getConvertedGoldPrice();
    const purity = karat / 24;
    const adjustedPrice = basePrice * purity;
    setConvertedPrice((adjustedPrice * amount).toFixed(2));
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setAmount(Number(e.target.value));
  };

  const handleKaratChange = (e: SelectChangeEvent<string>): void => {
    setKarat(Number(e.target.value));
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSelectedDate(e.target.value);
  };

  const handleCurrencyChange = (e: SelectChangeEvent<string>): void => {
    setCurrency(e.target.value);
    setConvertedPrice(null); // Reset old conversion
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-100 to-yellow-200 p-6">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="flex flex-col gap-4">
          <Typography variant="h5" component="h1" align="center">
            Gold Price Converter
          </Typography>
          <TextField
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            fullWidth
            variant="outlined"
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          {loading ? (
            <div className="flex justify-center">
              <CircularProgress />
            </div>
          ) : goldPriceUSD ? (
            <>
              <Typography className="text-green-600" variant="h6" align="center">
                {amount} gram {karat}K = {convertedPrice ? `${convertedPrice} ${currency}` : "?"}
              </Typography>

              <TextField
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Amount (grams)"
                fullWidth
                variant="outlined"
                margin="normal"
              />

              <Select
                value={String(karat)}
                onChange={handleKaratChange}
                fullWidth
                variant="outlined"
              >
                <MenuItem value={24}>24K</MenuItem>
                <MenuItem value={22}>22K</MenuItem>
                <MenuItem value={18}>18K</MenuItem>
                <MenuItem value={14}>14K</MenuItem>
              </Select>

              <Select
                value={currency}
                onChange={handleCurrencyChange}
                fullWidth
                variant="outlined"
              >
                <MenuItem value="AZN">AZN</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="TRY">TRY</MenuItem>
              </Select>

              <Button
                variant="contained"
                color="primary"
                onClick={handleConvert}
              >
                Convert
              </Button>
            </>
          ) : (
            <Typography className="text-red-500" align="center">
              Price not found.
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
