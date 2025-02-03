"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useSession, signOut } from "next-auth/react";
import Swal from "sweetalert2";

type Gender = {
  gender_id: number;
  gender_code: string;
  gender: string;
};

type Role = {
  role_id: number;
  role_code: string;
  role: string;
};

type Department = {
  department_id: number;
  department_code: string;
  department: string;
}

type Rank = {
  rank_id: number;
  rank_code: string;
  full_rank: string;
}

type UserStatus = {
  user_status_id: number;
  user_status_code: string;
  user_status: string;
}

const UserCreate = () => {
  const { data: session } = useSession();
  const [genders, setGenders] = useState<Gender[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [userStatuses, setUserStatuses] = useState<UserStatus[]>([]);
  const [formData, setFormData] = useState({
    rank_id: "",
    firstname: "",
    lastname: "",
    email: "",
    user_password: "",
    confirm_user_password: "",
    phone_number: "",
    birthdate: "",
    gender_id: "",
    role_id: "",
    department_id: "",
    user_status_id: "",
  });


  const permissionValue = 3;

  useEffect(() => {
    fetchGenders();
    fetchRanks();
    fetchRoles();
    fetchDepartments();
    fetchUserStatuses();
  }, [session]);

  // Fetch genders
  const fetchGenders = async () => {
    if (session?.user?.token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/gender`, {
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
          setGenders(result.data); // เก็บข้อมูล genders
        } else {
          console.error("Error fetching genders:", result.message);
        }
      } catch (error) {
        console.error("Error fetching genders:", error);
      }
    }
  };

  // Fetch ranks
  const fetchRanks = async () => {
    if (session?.user?.token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rank`, {
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
          setRanks(result.data); // เก็บข้อมูล ranks
        } else {
          console.error("Error fetching ranks:", result.message);
        }
      } catch (error) {
        console.error("Error fetching ranks:", error);
      }
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    if (session?.user?.token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/role`, {
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
          setRoles(result.data); // เก็บข้อมูล roles
        } else {
          console.error("Error fetching roles:", result.message);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    if (session?.user?.token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/department`, {
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
          setDepartments(result.data); // เก็บข้อมูล departments
        } else {
          console.error("Error fetching departments:", result.message);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    }
  };

  // Fetch user statuses
  const fetchUserStatuses = async () => {
    if (session?.user?.token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userstatus`, {
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
          setUserStatuses(result.data); // เก็บข้อมูล user statuses
          setFormData((prevData) => ({
            ...prevData,
            user_status_id: result.data[0].user_status_id.toString(),
          }));
        } else {
          console.error("Error fetching user statuses:", result.message);
        }
      } catch (error) {
        console.error("Error fetching user statuses:", error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    return Object.values(formData).every((value) => value.trim() !== "");
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

    if (formData.user_password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Password Too Short",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }
  
    // ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
    if (formData.user_password !== formData.confirm_user_password) {
      Swal.fire({
        icon: "error",
        title: "Passwords Do Not Match",
        text: "User password and confirm password must match.",
      });
      return;
    }

    // ส่งข้อมูลไปยัง API
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, {
        method: "POST",
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
          text: "User has been created successfully!",
        });
        setFormData({
          rank_id: "",
          firstname: "",
          lastname: "",
          email: "",
          user_password: "",
          confirm_user_password: "",
          phone_number: "",
          birthdate: "",
          gender_id: "",
          role_id: "",
          department_id: "",
          user_status_id: "",
        });
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
        <Breadcrumb pageName="Settings" />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-5">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  User Create
                </h3>
              </div>
              <div className="p-7">
                <form action="#">
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="rank_id"
                      >
                        Rank
                      </label>
                      <select
                        id="rank_id"
                        name="rank_id"
                        value={formData.rank_id}
                        onChange={handleChange}
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      >
                        <option value="" disabled>
                          Select Rank
                        </option>
                        {ranks.map((rank) => (
                          <option key={rank.rank_id} value={rank.rank_id}>
                            {rank.full_rank}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-2/5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="firstname"
                      >
                        First Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="firstname"
                          id="firstname"
                          placeholder="Devid"
                          value={formData.firstname}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-2/5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="lastname"
                      >
                        Last Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="lastname"
                          id="lastname"
                          placeholder="Jhon"
                          value={formData.lastname}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <svg
                          className="fill-current"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.8">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1907 11.7169 9.80879 11.7169 9.52186 11.5161L1.18853 5.68272C0.811486 5.4188 0.719791 4.89919 0.983719 4.52215Z"
                              fill=""
                            />
                          </g>
                        </svg>
                      </span>
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="email"
                        name="email"
                        id="email"
                        placeholder="devidjond45@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="user_password"
                      >
                        Password
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="user_password"
                        id="user_password"
                        value={formData.user_password}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="confirm_user_password"
                      >
                        Confirm Password
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="confirm_user_password"
                        id="confirm_user_password"
                        value={formData.confirm_user_password}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="phone_number"
                      >
                        Phone Number
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="phone_number"
                        id="phone_number"
                        placeholder="+990 3343 7865"
                        value={formData.phone_number}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="birthdate"
                      >
                        Birth Date
                      </label>
                      <input
                        id="birthdate"
                        name="birthdate"
                        type="date"
                        value={formData.birthdate}
                        onChange={handleChange}
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="gender_id"
                      >
                        Gender
                      </label>
                      <select
                        id="gender_id"
                        name="gender_id"
                        value={formData.gender_id}
                        onChange={handleChange}
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      >
                        <option value="" disabled>
                          Select Gender
                        </option>
                        {genders.map((gender) => (
                          <option key={gender.gender_id} value={gender.gender_id}>
                            {gender.gender}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="role_id"
                      >
                        Role
                      </label>
                      <select
                        id="role_id"
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleChange}
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      >
                        <option value="" disabled>
                          Select Role
                        </option>
                        {roles.map((role) => (
                          <option key={role.role_id} value={role.role_id}>
                            {role.role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="department_id"
                      >
                        Department
                      </label>
                      <select
                        id="department_id"
                        name="department_id"
                        value={formData.department_id}
                        onChange={handleChange}
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      >
                        <option value="" disabled>
                          Select Department
                        </option>
                        {departments.map((department) => (
                          <option key={department.department_id} value={department.department_id}>
                            {department.department}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="user_status_id"
                      >
                        User Status
                      </label>
                      <select
                        id="user_status_id"
                        name="user_status_id"
                        value={formData.user_status_id}
                        onChange={handleChange}
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      >
                        <option value="" disabled>
                          Select User Status
                        </option>
                        {userStatuses.map((user_status) => (
                          <option key={user_status.user_status_id} value={user_status.user_status_id}>
                            {user_status.user_status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="button"
                      onClick={() => setFormData({
                        rank_id: "",
                        firstname: "",
                        lastname: "",
                        email: "",
                        user_password: "",
                        confirm_user_password: "",
                        phone_number: "",
                        birthdate: "",
                        gender_id: "",
                        role_id: "",
                        department_id: "",
                        user_status_id: "",
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

export default UserCreate;
