"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useSession, signOut } from "next-auth/react";
import Swal from "sweetalert2";

const RankUpdate = ({ params }: { params: { id: string } }) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    rank_code: "",
    full_rank: "",
    short_rank: "",
    sequence: ""
  });

  const { id } = params;

  const permissionValue = 23;

  useEffect(() => {
    fetchData();
  }, [session]);

  const fetchData = async () => {
    if (session?.user?.token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rank/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.user.token}`,
            "Content-Type": "application/json",
            Permission: permissionValue.toString(),
          },
        });

        if (response.status === 401) {
          signOut({ callbackUrl: "/auth/signin" });
        } else if (response.status === 403) {
          window.location.href = "/";
        }

        const result = await response.json();
        if (response.ok && result.status) {
          const mappedFormData = {
            rank_code: result.data.rank_code,
            full_rank: result.data.full_rank,
            short_rank: result.data.short_rank,
            sequence: result.data.sequence,
          };
          setFormData(mappedFormData);
        } else {
          console.error("Error fetching ranks:", result.message);
        }
      } catch (error) {
        console.error("Error fetching ranks:", error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // const validateForm = () => {
  //   return Object.values(formData).every((value) => value.trim() !== "");
  // };
  const validateForm = () => {
    return formData.full_rank.trim() !== "" && formData.short_rank.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Data",
        text: "Please fill out all fields before submitting!",
      });
      return;
    }

    // ส่งข้อมูลไปยัง API
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rank/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
          "Content-Type": "application/json",
          Permission: permissionValue.toString(),
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Rank has been updated successfully!",
        });
        fetchData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "Something went wrong!",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred!",
      });
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
      <Breadcrumb pageName={["User Management", "Ranks", "Rank Update"]} />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-5">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="p-7">
                <form action="#">
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="rank_code"
                    >
                      Rank Code
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="rank_code"
                        id="rank_code"
                        value={formData.rank_code}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="full_rank"
                    >
                      Full Rank
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="full_rank"
                        id="full_rank"
                        value={formData.full_rank}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="rank"
                    >
                      Short Rank
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="short_rank"
                        id="short_rank"
                        value={formData.short_rank}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="sequence"
                    >
                      Sequence
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="sequence"
                        id="sequence"
                        value={formData.sequence}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="button"
                      onClick={() => setFormData({
                        rank_code: formData.rank_code,
                        full_rank: "",
                        short_rank: "",
                        sequence: ""
                      })}
                    >
                      Clear
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                      onClick={handleSubmit}
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default RankUpdate;
