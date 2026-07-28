"use client";

import React, { useState } from "react";
import { Clock3, Plus } from "lucide-react";
import { Attachment, Calendar, NavArrowDownSolid } from "iconoir-react";
import { CreateEvent } from "@/hooks/useAdmin";
import { generateSignedUrlToUploadOn } from "@/actions";

const fieldBase =
  "h-12 w-full rounded-md border border-stone-700 bg-transparent px-4 text-sm text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-400";

const selectBase =
  "h-12 w-full appearance-none rounded-md border border-stone-700 bg-transparent px-4 pr-11 text-sm text-stone-400 outline-none transition-colors focus:border-rose-400";

const CreateCelebrationCruiseEvent = () => {
  const { mutate, isPending } = CreateEvent();

  const [form, setForm] = useState({
    title: "",
    description: "",
    totalTickets: "",
    currency: "",
    price: "",
    country: "",
    city: "",
  });

  const [image, setImage] = useState<File | null>(null);

  const [schedule, setSchedule] = useState([
    {
      date: "",
      startTime: "",
      endTime: "",
    },
  ]);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleScheduleChange = (
    index: number,
    field: "date" | "startTime" | "endTime",
    value: string,
  ) => {
    const temp = [...schedule];
    temp[index][field] = value;

    setSchedule(temp);
  };
  const addDay = () => {
    setSchedule((prev) => [
      ...prev,
      {
        date: "",
        startTime: "",
        endTime: "",
      },
    ]);
  };
  const uploadImage = async (file: File) => {
    const { signedUrl, key } = await generateSignedUrlToUploadOn(
      file.name,
      file.type,
    );

    await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    return key;
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      let imageKey: string | null = null;

      if (image) {
        imageKey = await uploadImage(image);
      }

      const payload = {
        title: form.title,
        description: form.description,
        totalTickets: Number(form.totalTickets),
        availableTickets: Number(form.totalTickets),
        currency: form.currency,
        price: Number(form.price),
        image: image ? imageKey : null,
        country: form.country,
        city: form.city,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        lat: null,
        lng: null,
        schedule: schedule.map((item) => ({
          date: item.date,
          startTime: item.startTime.split(":")[0],
          endTime: item.endTime.split(":")[0],
        })),
      };

      mutate(payload);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <main className="w-full text-stone-200">
      <form onSubmit={handleSubmit} className="space-y-2">
        <section className="rounded-xl border border-stone-700 p-2 sm:p-2">
          <h2 className="mb-2 text-sm font-medium text-stone-100">
            Event Details
          </h2>

          <div className="grid gap-4 lg:grid-cols-2 mb-3">
            <label className="space-y-1">
              <span className="block text-xs font-normal text-stone-100">
                Name of Event
              </span>
              <input
                className={fieldBase}
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Title"
                type="text"
              />
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-medium text-stone-100">
                Number Of Tickets
              </span>
              <input
                className={fieldBase}
                placeholder="500"
                name="totalTickets"
                type="number"
                value={form.totalTickets}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="grid gap-4 lg:grid-cols-3 mb-3">
            <label className="space-y-1">
              <span className="block text-xs font-normal text-stone-100">
                Select Currency
              </span>
              <div className="relative">
                <select
                  className={selectBase}
                  defaultValue=""
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="eur">EUR</option>
                  <option value="usd">USD</option>
                  <option value="gbp">GBP</option>
                </select>
                <NavArrowDownSolid className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              </div>
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-medium text-stone-100">
                Ticket Price
              </span>
              <input
                className={fieldBase}
                placeholder="500"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
              />
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-medium text-stone-100">
                Upload Image
              </span>
              <div className="relative">
                <input
                  id="event-image"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImage(e.target.files[0]);
                    }
                  }}
                />

                <label
                  htmlFor="event-image"
                  className={`${fieldBase} flex cursor-pointer items-center justify-between`}
                >
                  <span>{image ? image.name : "Browse"}</span>
                  <Attachment className="h-4 w-4" />
                </label>
              </div>
            </label>
          </div>
          <label className="space-y-1 lg:col-span-2">
            <span className="block text-xs font-normal text-stone-100">
              Description
            </span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="min-h-36 w-full resize-none rounded-md border border-stone-700 bg-transparent px-4 py-4 text-sm text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-rose-400"
              placeholder="Model"
            />
          </label>
        </section>

        <section className="rounded-xl border border-stone-700 p-2 sm:p-2 mb-5">
          <h2 className="mb-2 text-sm font-medium text-stone-100">
            Schedule &amp; Location
          </h2>

          {schedule.map((item, index) => (
            <div
              key={index}
              className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr_0.65fr_auto] mb-4"
            >
              {/* Date */}
              <label className="space-y-1">
                <span className="block text-xs font-normal text-stone-100">
                  Date
                </span>

                <input
                  type="date"
                  value={item.date}
                  onChange={(e) =>
                    handleScheduleChange(index, "date", e.target.value)
                  }
                  className={fieldBase}
                />
              </label>

              {/* Start Time */}
              <label className="space-y-1">
                <span className="block text-xs font-normal text-stone-100">
                  Start Time
                </span>

                <input
                  type="time"
                  value={item.startTime}
                  onChange={(e) =>
                    handleScheduleChange(index, "startTime", e.target.value)
                  }
                  className={fieldBase}
                />
              </label>

              {/* End Time */}
              <label className="space-y-1">
                <span className="block text-xs font-normal text-stone-100">
                  End Time
                </span>

                <input
                  type="time"
                  value={item.endTime}
                  onChange={(e) =>
                    handleScheduleChange(index, "endTime", e.target.value)
                  }
                  className={fieldBase}
                />
              </label>

              {/* Add Day Button */}
              {index === schedule.length - 1 && (
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addDay}
                    className="mb-3 inline-flex items-center gap-2 text-xs text-stone-300"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add another day
                  </button>
                </div>
              )}
            </div>
          ))}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 ">
              <span className="block text-xs font-normal text-stone-100">
                Country
              </span>
              <div className="relative">
                <select
                  className={selectBase}
                  defaultValue=""
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="france">France</option>
                  <option value="spain">Spain</option>
                  <option value="netherlands">Netherlands</option>
                </select>
                <NavArrowDownSolid className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              </div>
            </label>

            <label className="space-y-1 ">
              <span className="block text-xs font-normal text-stone-100">
                City
              </span>
              <div className="relative">
                <select
                  className={selectBase}
                  defaultValue=""
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="paris">Paris</option>
                  <option value="barcelona">Barcelona</option>
                  <option value="amsterdam">Amsterdam</option>
                </select>
                <NavArrowDownSolid className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              </div>
            </label>
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-[minmax(180px,310px)_1fr]">
          <button
            type="button"
            className="h-12 rounded-md border border-stone-200/70 text-sm font-medium text-stone-200 transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-12 rounded-md bg-rose-500 text-sm font-medium text-white transition-colors hover:bg-rose-400"
          >
            Add Event
          </button>
        </div>
      </form>
    </main>
  );
};

export default CreateCelebrationCruiseEvent;
