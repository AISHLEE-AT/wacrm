'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter } from 'lucide-react';

interface MarketData {
  id: string;
  title: string;
  description: string;
  loaded_date: string;
  extra_data: {
    commodity: string;
    market: string;
    district: string;
    modal_price: string;
  };
}

export default function MarketPriceBoard({ userDistrict }: { userDistrict?: string }) {
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState(userDistrict || 'All');
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      const supabase = createClient();
      
      // Fetch latest mandi data (limit to recent records to ensure we get today's data)
      const { data: mandiData, error } = await supabase
        .from('daily_news')
        .select('id, title, description, loaded_date, extra_data')
        .eq('data_type', 'mandi')
        .order('loaded_date', { ascending: false })
        .limit(2000);

      if (!error && mandiData) {
        // Find the latest loaded date
        const latestDate = mandiData.length > 0 ? mandiData[0].loaded_date : null;
        
        // Filter only the latest date's records to avoid duplicates across days in the view
        const latestRecords = mandiData.filter((d: any) => d.loaded_date === latestDate) as MarketData[];
        setData(latestRecords);

        // Extract unique districts
        const uniqueDistricts = Array.from(
          new Set(latestRecords.map((d) => d.extra_data?.district).filter(Boolean))
        ).sort();
        setDistricts(uniqueDistricts);
      }
      setLoading(false);
    };
    fetchPrices();
  }, []);

  const filteredData = data.filter((item) => {
    const d = item.extra_data?.district || '';
    const c = item.extra_data?.commodity || '';
    const matchesDistrict = districtFilter === 'All' || d === districtFilter;
    const matchesSearch = c.toLowerCase().includes(search.toLowerCase()) || d.toLowerCase().includes(search.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl mt-6">
      <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            🌾 Tamil Nadu Agro Market Prices
          </h2>
          <p className="text-slate-400 text-sm mt-1">Live Mandi Prices from data.gov.in</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none"
            >
              <option value="All">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search commodity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[500px]">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No market prices found for the selected filters.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-300 relative">
            <thead className="bg-slate-950/90 text-slate-400 uppercase text-xs sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-medium">Commodity</th>
                <th className="px-6 py-4 font-medium">District (Market)</th>
                <th className="px-6 py-4 font-medium text-right">Modal Price (₹/Qtl)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-emerald-100">
                    {item.extra_data?.commodity}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300">{item.extra_data?.district}</span>
                    <span className="text-slate-500 text-xs ml-2">({item.extra_data?.market})</span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">
                    ₹{item.extra_data?.modal_price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
