import React, { useState, useRef, useEffect } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  MarkerF,          // ← Changed from Marker (deprecated)
  Autocomplete,
} from "@react-google-maps/api";
import { toast } from "sonner";

// Define prop types
interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (address: string, position: LatLng) => void;
  initialCenter?: LatLng;
}

interface LatLng {
  lat: number;
  lng: number;
}

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialCenter,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null);
  const [address, setAddress] = useState<string>("");
  const defaultSpainCenter: LatLng = { lat: 40.4168, lng: -3.7038 }; // Madrid, Spain
  const [mapCenter, setMapCenter] = useState<LatLng>(
    initialCenter || defaultSpainCenter
  );

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const allowedCountries = ["GB", "NL", "BE", "ES", "FR"];

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script-location-picker", // unique id prevents duplicate load attempts
    googleMapsApiKey: "AIzaSyCDZoRf-BZL2yR_ZyXpzht_a63hMgLCTis",
    libraries,
    // Optional: prevents font loading issues / reduces payload
    preventGoogleFontsLoading: true,
  });

  const grayStyle = [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ saturation: -100 }, { lightness: 60 }],
    },
    {
      featureType: "administrative.country",
      elementType: "geometry.stroke",
      stylers: [{ color: "#999999" }, { weight: 1 }],
    },
  ];

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPosition(null);
      setAddress("");
      autocompleteRef.current = null;
      setMapCenter(defaultSpainCenter);
    }
  }, [isOpen]);

  // Update map center when initialCenter changes or modal opens
  useEffect(() => {
    if (isOpen && initialCenter) {
      setMapCenter(initialCenter);
    }
  }, [isOpen, initialCenter]);

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "400px",
    borderRadius: "8px",
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const latLng: LatLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };

    const geocoder = new google.maps.Geocoder(); // ← no need for window.google
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        let countryCode = "";
        const formattedAddress = results[0].formatted_address;

        results[0].address_components.forEach((component) => {
          if (component.types.includes("country")) {
            countryCode = component.short_name;
          }
        });

        if (!allowedCountries.includes(countryCode)) {
          toast.error("Sorry, only UK, NL, BE, ES, FR countries are allowed.");
          setSelectedPosition(null);
          setAddress("");
          return;
        }

        setSelectedPosition(latLng);
        setAddress(formattedAddress || "");
      }
    });
  };

  const handlePlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (place.geometry?.location) {
      const latLng: LatLng = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setSelectedPosition(latLng);
      setAddress(place.formatted_address || "");
      if (mapRef.current) {
        mapRef.current.panTo(latLng);
        mapRef.current.setZoom(15); // optional: zoom in on selection
      }
    }
  };

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const handleSelect = () => {
    if (address && selectedPosition) {
      onSelectLocation(address, selectedPosition);
      onClose();
    }
  };

  if (!isOpen) return null;

  // ── Loading / Error UI ──────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-zinc-900 rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-red-400 text-xl mb-4">Failed to load Google Maps</h2>
          <p className="text-stone-300 mb-6">
            Please check your API key, network, or if Maps JavaScript + Places API are enabled in Google Cloud Console.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-zinc-700 text-stone-200 rounded-lg hover:bg-zinc-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-zinc-900 rounded-xl p-8 text-stone-300 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  // ── Main modal content (API is loaded) ──────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-3xl"> {/* improved sizing */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-stone-100 text-xl font-medium">Select Location</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <Autocomplete
          onLoad={(autocomplete) => {
            autocompleteRef.current = autocomplete;
            autocomplete.setComponentRestrictions({
              country: ["gb", "nl", "be", "es", "fr"],
            });
          }}
          onPlaceChanged={handlePlaceChanged}
        >
          <input
            type="text"
            placeholder="Search for a location..."
            value={address}                    // ← now controlled
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3.5 mb-5 bg-zinc-800 border border-zinc-700 rounded-lg text-stone-200 placeholder-zinc-500 focus:outline-none focus:border-blue-600"
          />
        </Autocomplete>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={initialCenter ? 15 : 5} // zoom closer if we have initial center
          onClick={handleMapClick}
          onLoad={handleMapLoad}
          options={{ styles: grayStyle, disableDefaultUI: false }}
        >
          {selectedPosition && <MarkerF position={selectedPosition} />}
        </GoogleMap>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-zinc-800 text-stone-200 rounded-lg hover:bg-zinc-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!address.trim() || !selectedPosition}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;