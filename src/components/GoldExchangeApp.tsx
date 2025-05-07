import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";

interface GoldApiResponse {
  price: number;
}

export default function GoldExchangeApp() {
  const [goldPriceUSD, setGoldPriceUSD] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [karat, setKarat] = useState<number>(24);
  const [convertedPrice, setConvertedPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currency, setCurrency] = useState("AZN");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2025-04-01"));

  const [usdToAznRate, setUsdToAznRate] = useState<number>(1.7);
  const [usdToTryRate, setUsdToTryRate] = useState<number | null>(null);

  const fetchInitialData = async (date: Date): Promise<void> => {
    setLoading(true);
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const [goldResponse, forexResponse] = await Promise.all([
        axios.get<GoldApiResponse>(
          `https://www.goldapi.io/api/XAU/USD/${formattedDate}`,
          {
            // headers: {
            //   "x-access-token": "goldapi-17u0bism9tjxq17-io",
            //   "Content-Type": "application/json",
            // },
          }
        ),
        axios.get(
          // "https://api.fastforex.io/fetch-multi?from=USD&to=TRY&api_key=0b0a2773d7-070035cbba-sv5v3w"
          "httpss://api.fastforex.io/fetch-multi?from=USD&to=TRY&api_key=0b0a2773d7-070035cbba-sv5v3w"
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
    return goldPriceUSD;
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r ">
      <Card className="w-full max-w-md shadow-xl rounded-3xl p-8">
        <CardContent className="flex flex-col gap-6">
          <h1 className="text-2xl font-extrabold text-center text-gray-800">Gold Price Converter</h1>

          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : !goldPriceUSD ? (
            <>
              <p className="text-green-600 text-center text-lg">
                {amount}g {karat}K = {convertedPrice ? `${convertedPrice} ${currency}` : "?"}
              </p>

              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Amount (g)"
                className="rounded-xl shadow-sm"
              />

              <div className="flex flex-col gap-4">
                <Select value={String(karat)} onValueChange={(value) => setKarat(Number(value))}>
                  <SelectTrigger className="rounded-xl shadow-sm flex items-center justify-between">
                    <SelectValue placeholder="Select Karat" />
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg">
                    <SelectItem value="24">24K</SelectItem>
                    <SelectItem value="22">22K</SelectItem>
                    <SelectItem value="18">18K</SelectItem>
                    <SelectItem value="14">14K</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={currency} onValueChange={(value) => setCurrency(value)}>
                  <SelectTrigger className="rounded-xl shadow-sm flex items-center justify-between">
                    <SelectValue placeholder="Select Currency" />
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg">
                    <SelectItem value="AZN">AZN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="TRY">TRY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleConvert} className="w-full mt-4 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600">
                Convert
              </Button>
            </>
          ) : (
            <p className="text-red-500 text-center">Price not found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
