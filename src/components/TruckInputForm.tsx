import { useState } from 'react';
import { MapPin, ArrowRight, Truck, Search, Weight } from 'lucide-react';
import { CITIES, TRUCK_TYPES, TRUCK_CAPACITY_MT, type TruckInput } from '../data';

interface Props {
  onSubmit: (input: TruckInput) => void;
}

export default function TruckInputForm({ onSubmit }: Props) {
  const [sourceCity, setSourceCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [truckType, setTruckType] = useState(TRUCK_TYPES[0]);

  // Capacity is derived from truck type — not user input
  const maxCapacity = TRUCK_CAPACITY_MT[truckType] ?? 20;

  const canSubmit = sourceCity.trim() && destinationCity.trim() && sourceCity !== destinationCity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // Pass maxCapacity as capacity so TruckInput interface stays unchanged
    onSubmit({ sourceCity, destinationCity, capacity: maxCapacity, truckType });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/20 mb-4">
          <Truck className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Enter Trip Details</h2>
        <p className="text-slate-500 mt-1">
          Provide your truck and route information to find optimal return loads
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1.5 text-cyan-600" />
              Source City
            </label>
            <input
              type="text"
              list="source-cities"
              value={sourceCity}
              onChange={(e) => setSourceCity(e.target.value)}
              placeholder="e.g., Mumbai"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
            />
            <datalist id="source-cities">
              {CITIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1.5 text-teal-600" />
              Destination City
            </label>
            <input
              type="text"
              list="dest-cities"
              value={destinationCity}
              onChange={(e) => setDestinationCity(e.target.value)}
              placeholder="e.g., Pune"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
            <datalist id="dest-cities">
              {CITIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            <Truck className="w-4 h-4 inline mr-1.5 text-slate-500" />
            Truck Type
          </label>
          <select
            value={truckType}
            onChange={(e) => setTruckType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
          >
            {TRUCK_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Replaces the slider — shows real capacity derived from truck type */}
        <div className="mb-8 p-4 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Weight className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-semibold text-slate-700">
              Max Payload Capacity
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-cyan-600">{maxCapacity} MT</span>
            <p className="text-xs text-slate-400 mt-0.5">
              Based on {truckType} truck type
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 text-sm text-slate-500 mb-6 bg-slate-50 rounded-xl p-4">
          <span className="font-medium text-slate-700">{sourceCity || 'Source'}</span>
          <ArrowRight className="w-4 h-4 text-cyan-500" />
          <span className="font-medium text-slate-700">{destinationCity || 'Destination'}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span>{truckType}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span>{maxCapacity} MT max</span>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          Find Return Loads
        </button>
      </form>
    </div>
  );
}