"use client";
import React, { useState, useEffect } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { TextEditor } from "../../components/policies/txtEditor";
import { toast } from "sonner";
import Loader from "../../components/ui/Loader";
import {
  getStudioFeatures,
  updateStudioFeatures,
} from "@/services/admin-services";
import { ADMIN_URLS } from "@/constants/apiUrls";
import { useRouter } from "next/navigation";
// Import your API functions - adjust path as needed
// import { getShootDetails, updateShootDetails } from "@/services/admin-services";
// import { ADMIN_URLS } from "@/constants/apiUrls";

const ShootDetailsForm = () => {
  const [shootGoals, setShootGoals] = useState([""]);
  const [shootFormats, setShootFormats] = useState([""]);
  const [vibes, setVibes] = useState([""]);
  const [outfits, setOutfits] = useState(0);
  const [addOnFeatures, setAddOnFeatures] = useState([
    { feature1: "", feature2: "" },
  ]);
  const [termsAndConditions, setTermsAndConditions] = useState({
    en: "",
    nl: "",
    es: "",
    fr: "",
  });

  const [expandedSections, setExpandedSections] = useState({
    shootGoals: false,
    shootFormats: false,
    vibes: false,
    outfits: false,
    addOnFeatures: false,
    termsAndConditions: false,
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [shootDetailsId, setShootDetailsId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchShootDetails();
  }, []);

  const fetchShootDetails = async () => {
    setInitialLoading(true);
    try {
      const response = await getStudioFeatures(
        `${ADMIN_URLS.GET_STUDIO_FEATURES}`,
      );

      if (response?.data?.success && response?.data?.data) {
        const data = response?.data?.data;

        setShootDetailsId(data._id);

        if (data.shootGoals && data.shootGoals.length > 0) {
          setShootGoals(data.shootGoals);
        }

        if (data.shootFormat && data.shootFormat.length > 0) {
          setShootFormats(data.shootFormat);
        }

        if (data.vibes && data.vibes.length > 0) {
          setVibes(data.vibes);
        }

        if (data.canBringOutfits !== undefined) {
          setOutfits(data.canBringOutfits);
        }

        if (data.addOnFeatures && data.addOnFeatures.length > 0) {
          const mappedFeatures = data.addOnFeatures.map((feature) => ({
            feature1: feature.key || "",
            feature2: feature.value ? feature.value.toString() : "",
          }));
          setAddOnFeatures(mappedFeatures);
        }

        if (data.shootPolicy) {
          setTermsAndConditions({
            en: data.shootPolicy.en || "",
            nl: data.shootPolicy.nl || "",
            es: data.shootPolicy.es || "",
            fr: data.shootPolicy.fr || "",
          });
        }
      } else {
        toast.error("Failed to load shoot details");
      }
    } catch (error) {
      console.error("Error fetching shoot details:", error);
      toast.error("Error loading shoot details");
    } finally {
      setInitialLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const addShootGoal = () => {
    setShootGoals([...shootGoals, ""]);
  };

  const updateShootGoal = (index, value) => {
    const updated = [...shootGoals];
    updated[index] = value;
    setShootGoals(updated);
  };

  const removeShootGoal = (index) => {
    if (shootGoals.length > 1) {
      setShootGoals(shootGoals.filter((_, i) => i !== index));
    }
  };

  const addShootFormat = () => {
    setShootFormats([...shootFormats, ""]);
  };

  const updateShootFormat = (index, value) => {
    const updated = [...shootFormats];
    updated[index] = value;
    setShootFormats(updated);
  };

  const removeShootFormat = (index) => {
    if (shootFormats.length > 1) {
      setShootFormats(shootFormats.filter((_, i) => i !== index));
    }
  };

  const addVibe = () => {
    setVibes([...vibes, ""]);
  };

  const updateVibe = (index, value) => {
    const updated = [...vibes];
    updated[index] = value;
    setVibes(updated);
  };

  const removeVibe = (index) => {
    if (vibes.length > 1) {
      setVibes(vibes.filter((_, i) => i !== index));
    }
  };

  const addAddOnFeatureRow = () => {
    setAddOnFeatures([...addOnFeatures, { feature1: "", feature2: "" }]);
  };

  const updateAddOnFeature = (index, field, value) => {
    const updated = [...addOnFeatures];
    updated[index][field] = value;
    setAddOnFeatures(updated);
  };

  const removeAddOnFeatureRow = (index) => {
    if (addOnFeatures.length > 1) {
      setAddOnFeatures(addOnFeatures.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        id: shootDetailsId,
        shootGoals: shootGoals.filter((goal) => goal.trim() !== ""),
        shootFormat: shootFormats.filter((format) => format.trim() !== ""),
        vibes: vibes.filter((vibe) => vibe.trim() !== ""),
        canBringOutfits: Number(outfits),
        addOnFeatures: addOnFeatures
          .filter(
            (row) => row.feature1.trim() !== "" && row.feature2.trim() !== "",
          )
          .map((row) => ({
            key: row.feature1.trim(),
            value: parseFloat(row.feature2.trim()) || 0,
          })),
        shootPolicy: {
          en: termsAndConditions.en,
          nl: termsAndConditions.nl,
          es: termsAndConditions.es,
          fr: termsAndConditions.fr,
        },
      };
      const response = await updateStudioFeatures(
        `${ADMIN_URLS.UPDATE_STUDIO_FEATURE}`,
        payload,
      );

      if (response?.data?.success) {
        toast.success("Shoot details updated successfully!");
        router.push("/admin/manage-studios");

        await fetchShootDetails();
      } else {
        toast.error(
          response?.data?.message || "Failed to update shoot details",
        );
      }
    } catch (error) {
      console.error("Error updating shoot details:", error);
      toast.error(
        error?.response?.data?.message || "Error updating shoot details",
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 p-4 rounded-lg bg-[#383838]/80">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("shootGoals")}
        >
          <div className="text-stone-200 text-xl font-extrabold ">
            Shoot Goals
          </div>
          <button className="w-5 h-5 opacity-50 cursor-pointer hover:opacity-100">
            {expandedSections.shootGoals ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {expandedSections.shootGoals && (
          <div className="p-5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 flex flex-col gap-5">
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-2.5">
                <div className="rounded-[10px] flex flex-col gap-2">
                  {shootGoals.map((goal, index) => (
                    <div key={index} className="flex items-center gap-2.5">
                      <input
                        type="text"
                        placeholder="Type your text here"
                        value={goal}
                        onChange={(e) => updateShootGoal(index, e.target.value)}
                        className="flex-1 px-4 py-3.5 bg-zinc-900/80 rounded-[10px] text-zinc-400 text-sm font-light   outline-1 outline-offset-[-1px] outline-neutral-700"
                      />
                      <div className="w-12 h-4 relative">
                        <button
                          onClick={() => removeShootGoal(index)}
                          className="w-7 h-7 absolute left-[11px] top-[-6px] bg-rose-500 rounded hover:bg-rose-600 flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full flex flex-row-reverse">
              <button
                onClick={addShootGoal}
                className="text-blue-500 text-xs font-medium  underline cursor-pointer hover:text-blue-400"
              >
                + Add New
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 rounded-lg bg-[#383838]/80">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("shootFormats")}
        >
          <div className="text-stone-200 text-xl font-extrabold ">
            Shoot Format
          </div>
          <button className="w-5 h-5 opacity-50 cursor-pointer hover:opacity-100">
            {expandedSections.shootFormats ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {expandedSections.shootFormats && (
          <div className="p-5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 flex flex-col gap-5">
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-2.5">
                <div className="rounded-[10px] flex flex-col gap-2">
                  {shootFormats.map((format, index) => (
                    <div key={index} className="flex items-center gap-2.5">
                      <input
                        type="text"
                        placeholder="Type your text here"
                        value={format}
                        onChange={(e) =>
                          updateShootFormat(index, e.target.value)
                        }
                        className="flex-1 px-4 py-3.5 bg-zinc-900/80 rounded-[10px] text-zinc-400 text-sm font-light   outline-1 outline-offset-[-1px] outline-neutral-700"
                      />
                      <div className="w-12 h-4 relative">
                        <button
                          onClick={() => removeShootFormat(index)}
                          className="w-7 h-7 absolute left-[11px] top-[-6px] bg-rose-500 rounded hover:bg-rose-600 flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full flex flex-row-reverse">
              <button
                onClick={addShootFormat}
                className="text-blue-500 text-xs font-medium  underline cursor-pointer hover:text-blue-400"
              >
                + Add New
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 rounded-lg bg-[#383838]/80">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("vibes")}
        >
          <div className="text-stone-200 text-xl font-extrabold ">Vibes</div>
          <button className="w-5 h-5 opacity-50 cursor-pointer hover:opacity-100">
            {expandedSections.vibes ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {expandedSections.vibes && (
          <div className="p-5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 flex flex-col gap-5">
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-2.5">
                <div className="rounded-[10px] flex flex-col gap-2">
                  {vibes.map((vibe, index) => (
                    <div key={index} className="flex items-center gap-2.5">
                      <input
                        type="text"
                        placeholder="Type your text here"
                        value={vibe}
                        onChange={(e) => updateVibe(index, e.target.value)}
                        className="flex-1 px-4 py-3.5 bg-zinc-900/80 rounded-[10px] text-zinc-400 text-sm font-light  outline-1 outline-offset-[-1px] outline-neutral-700"
                      />
                      <div className="w-12 h-4 relative">
                        <button
                          onClick={() => removeVibe(index)}
                          className="w-7 h-7 absolute left-[11px] top-[-6px] bg-rose-500 rounded hover:bg-rose-600 flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full flex flex-row-reverse">
              <button
                onClick={addVibe}
                className="text-blue-500 text-xs font-medium  underline cursor-pointer hover:text-blue-400"
              >
                + Add New
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 rounded-lg bg-[#383838]/80">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("outfits")}
        >
          <div className="text-stone-200 text-xl font-extrabold ">
            Can Bring Outfits
          </div>
          <button className="w-5 h-5 opacity-50 cursor-pointer hover:opacity-100">
            {expandedSections.outfits ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {expandedSections.outfits && (
          <div className="p-5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <input
                type="number"
                placeholder="Number of outfits"
                value={outfits}
                onChange={(e) => setOutfits(Number(e.target.value))}
                className="flex-1 px-4 py-3.5 bg-zinc-900/80 rounded-[10px] text-zinc-400 text-sm font-light  outline-1 outline-offset-[-1px] outline-neutral-700"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 rounded-lg bg-[#383838]/80">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("addOnFeatures")}
        >
          <div className="text-stone-200 text-xl font-extrabold ">
            Add On Features
          </div>
          <button className="w-5 h-5 opacity-50 cursor-pointer hover:opacity-100">
            {expandedSections.addOnFeatures ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {expandedSections.addOnFeatures && (
          <div className="p-5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 flex flex-col gap-5">
            <div className="flex flex-col gap-3.5">
              {addOnFeatures.map((row, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <div className="flex-1 grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="Feature Name"
                      value={row.feature1}
                      onChange={(e) =>
                        updateAddOnFeature(index, "feature1", e.target.value)
                      }
                      className="px-4 py-3.5 bg-zinc-900/80 rounded-[10px]  outline-1 outline-offset-[-1px] outline-neutral-700 text-zinc-400 text-sm font-light "
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={row.feature2}
                      onChange={(e) =>
                        updateAddOnFeature(index, "feature2", e.target.value)
                      }
                      className="px-4 py-3.5 bg-zinc-900/80 rounded-[10px]  outline-1 outline-offset-[-1px] outline-neutral-700 text-zinc-400 text-sm font-light "
                    />
                  </div>
                  <div className="flex items-center gap-2.5 justify-center">
                    <button
                      onClick={() => removeAddOnFeatureRow(index)}
                      className="w-7 h-7 bg-rose-500 rounded hover:bg-rose-600 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addAddOnFeatureRow}
              className="text-blue-500 text-xs font-medium  underline self-end cursor-pointer hover:text-blue-400"
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 rounded-lg bg-[#383838]/80">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("termsAndConditions")}
        >
          <div className="text-stone-200 text-xl font-extrabold ">
            Shoot Policy
          </div>
          <button className="w-5 h-5 opacity-50 cursor-pointer hover:opacity-100">
            {expandedSections.termsAndConditions ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {expandedSections.termsAndConditions && (
          <div className="flex flex-col gap-5">
            <TextEditor
              language="English"
              value={termsAndConditions.en}
              setDescription={(content) =>
                setTermsAndConditions({ ...termsAndConditions, en: content })
              }
            />
            <TextEditor
              language="Dutch"
              value={termsAndConditions.nl}
              setDescription={(content) =>
                setTermsAndConditions({ ...termsAndConditions, nl: content })
              }
            />
            <TextEditor
              language="Spanish"
              value={termsAndConditions.es}
              setDescription={(content) =>
                setTermsAndConditions({ ...termsAndConditions, es: content })
              }
            />
            <TextEditor
              language="French"
              value={termsAndConditions.fr}
              setDescription={(content) =>
                setTermsAndConditions({ ...termsAndConditions, fr: content })
              }
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full px-5 py-4 bg-rose-500 rounded-[10px] text-white text-sm font-semibold  capitalize cursor-pointer hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Updating..." : "Update Shoot Details"}
      </button>
    </div>
  );
};

export default ShootDetailsForm;
