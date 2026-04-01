import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiMapPin, FiSave, FiNavigation } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import { faceAttendanceAPI } from '../services/api';

const CompanyLocation = () => {
  const [form, setForm] = useState({
    office_name: '',
    office_lat: '',
    office_lng: '',
    allowed_radius_meters: 200,
  });
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      const { data } = await faceAttendanceAPI.getCompanyLocation();
      if (data.data) {
        setForm({
          office_name: data.data.office_name || '',
          office_lat: data.data.office_lat || '',
          office_lng: data.data.office_lng || '',
          allowed_radius_meters: data.data.allowed_radius_meters || 200,
        });
      }
    } catch {}
  };

  const useCurrentLocation = () => {
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, office_lat: pos.coords.latitude, office_lng: pos.coords.longitude }));
        toast.success('Current location captured!');
        setDetecting(false);
      },
      (err) => { toast.error('Location error: ' + err.message); setDetecting(false); },
      { enableHighAccuracy: true }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await faceAttendanceAPI.setCompanyLocation(form);
      toast.success('Company location saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold mb-2">Company Location Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Set the office GPS location for face attendance verification.
        </p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card max-w-xl">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Office Name</label>
              <input type="text" className="input-field" placeholder="e.g. Head Office"
                value={form.office_name}
                onChange={(e) => setForm({ ...form, office_name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input type="number" step="any" required className="input-field"
                  placeholder="e.g. 28.6139"
                  value={form.office_lat}
                  onChange={(e) => setForm({ ...form, office_lat: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input type="number" step="any" required className="input-field"
                  placeholder="e.g. 77.2090"
                  value={form.office_lng}
                  onChange={(e) => setForm({ ...form, office_lng: e.target.value })} />
              </div>
            </div>

            <button type="button" onClick={useCurrentLocation} disabled={detecting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 transition-all">
              <FiNavigation size={15} />
              {detecting ? 'Detecting...' : 'Use My Current Location as Office'}
            </button>

            <div>
              <label className="block text-sm font-medium mb-1">
                Allowed Radius: <span className="text-blue-600">{form.allowed_radius_meters}m</span>
              </label>
              <input type="range" min="50" max="1000" step="50"
                value={form.allowed_radius_meters}
                onChange={(e) => setForm({ ...form, allowed_radius_meters: Number(e.target.value) })}
                className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>50m (strict)</span><span>500m</span><span>1000m (loose)</span>
              </div>
            </div>

            {form.office_lat && form.office_lng && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <FiMapPin size={16} />
                Office set at: {Number(form.office_lat).toFixed(5)}, {Number(form.office_lng).toFixed(5)} — radius {form.allowed_radius_meters}m
              </div>
            )}

            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all">
              <FiSave size={16} />
              {loading ? 'Saving...' : 'Save Location'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyLocation;
