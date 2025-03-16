"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Swal from "sweetalert2";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SearchBar from "@/components/SearchBar/SearchBar";
import ItemsPerPageSelector from "@/components/ItemsPerPageSelector/ItemsPerPageSelector";
import Pagination from "@/components/Pagination/Pagination";

// ประกาศ Type ของข้อมูล
type User = {
  user_id: number;
  user_code: string;
  email: string;
  role: string;
  department: string;
  full_rank: string;
  firstname: string;
  lastname: string;
  gender: string;
  birthdate: string;
  phone_number: string;
  user_status: string;
};

const UserSearch = () => {
  const { data: session } = useSession();
  const [data, setData] = useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [userPermissions, setUserPermissions] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "ascending" | "descending";
  } | null>(null);

  // กำหนดค่า Permission
  const permissionValue = 2;

  useEffect(() => {
    fetchPermissions();
    fetchData();
  }, [session]);

  const fetchPermissions = async () => {
    if (session?.user?.token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rolepermission/permissionbytokenuser`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.user.token}`,
            "Content-Type": "application/json"
          },
        });
        const result = await response.json();
        if (response.ok && result.status) {
          setUserPermissions(result.data);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    }
  };

  const fetchData = async () => {
    if (session?.user?.token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.user.token}`,
            "Content-Type": "application/json",
            Permission: permissionValue.toString(),
          },
        });

        if (response.status === 401) {
          signOut({ callbackUrl: "/auth/signin" })
        } else if (response.status === 403) {
          window.location.href = '/';
        }

        const result = await response.json();

        if (response.ok && result.status) {
          setData(result.data);
          setFilteredData(result.data);
        } else {
          console.error("Error fetching data:", result.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  // ค้นหา
  useEffect(() => {
    let updatedData = [...data];

    // กรองข้อมูล
    updatedData = updatedData.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    // จัดเรียงข้อมูล
    if (sortConfig) {
      updatedData.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(updatedData);
  }, [search, data, sortConfig]);

  // การแบ่งหน้า
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };

  // const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setItemsPerPage(Number(e.target.value));
  //   setCurrentPage(1);
  // };

  const handleSort = (key: keyof User) => {
    let direction: "ascending" | "descending" = "ascending";

    if (sortConfig?.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    setSortConfig({ key, direction });
  };

  // สร้างหน้าที่จะถูกแสดงใน Pagination
  // const getPaginationRange = () => {
  //   const range: number[] = [];
  //   const start = Math.max(currentPage - 2, 1);
  //   const end = Math.min(currentPage + 2, totalPages);

  //   for (let i = start; i <= end; i++) {
  //     range.push(i);
  //   }
  //   return range;
  // };

  const handleDelete = async (userId: number, userCode: string) => {
    Swal.fire({
      title: userCode,
      text: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      // confirmButtonColor: "#d33",
      // cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${userId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session?.user?.token}`,
              "Content-Type": "application/json",
              Permission: permissionValue.toString(),
            },
          });

          const result = await response.json();

          if (response.ok && result.status) {
            Swal.fire(
              "Deleted!",
              "The user has been deleted.",
              "success"
            );
            setData((prevData) => prevData.filter((user) => user.user_id !== userId));
            setFilteredData((prevData) => prevData.filter((user) => user.user_id !== userId));
          } else {
            Swal.fire(
              "Error!",
              result.message || "Something went wrong.",
              "error"
            );
          }
        } catch (error) {
          Swal.fire(
            "Error!",
            "Failed to delete user.",
            "error"
          );
          console.error("Error deleting user:", error);
        }
      }
    });
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Data Table with Sorting & Pagination" />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-5">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="px-7 py-4 dark:border-strokedark flex justify-between items-center">
                <h3 className="font-medium text-black dark:text-white">
                  Users Search
                </h3>
                {userPermissions.includes(3) && (
                  <Link
                    href="/users/create"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-center font-medium text-white hover:bg-opacity-90 w-1/4"
                  >
                    Create
                  </Link>
                )}
              </div>
              <div className="p-7">

                {/* Input ค้นหา */}
                <div className="mb-4 flex justify-between items-center">
                  {/* <input
                    type="text"
                    placeholder="Search all columns"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-1/2 px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  <div>
                    <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-600 dark:text-gray-400">
                      Rows per page:
                    </label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div> */}
                  <SearchBar search={search} setSearch={setSearch} />
                  <ItemsPerPageSelector itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto md:overflow-visible">
                  <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                      <tr>
                        {[
                          { key: "user_code", label: "User Code" },
                          { key: "firstname", label: "Name" },
                          { key: "role", label: "Role" },
                          { key: "department", label: "Department" },
                          { key: "email", label: "Email" },
                          { key: "user_status", label: "Status" },
                        ].map(({ key, label }) => (
                          <th
                            key={key}
                            className="cursor-pointer px-6 py-3"
                            onClick={() => handleSort(key as keyof User)}
                          >
                            {label} {sortConfig?.key === key && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                          </th>
                        ))}
                        <th className="px-6 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((user) => (
                        <tr
                          key={user.user_id}
                          className="border-b dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <td className="px-6 py-4">{user.user_code}</td>
                          <td className="px-6 py-4">
                            {user.full_rank} {user.firstname} {user.lastname}
                          </td>
                          <td className="px-6 py-4">{user.role}</td>
                          <td className="px-6 py-4">{user.department}</td>
                          <td className="px-6 py-4">{user.email}</td>
                          <td className="px-6 py-4">{user.user_status}</td>
                          <td className="px-6 py-4 text-center relative">
                            <button onClick={() => setDropdownOpen(dropdownOpen === user.user_id ? null : user.user_id)} className="px-4 py-2 bg-gray-500 text-white rounded">
                              Options
                            </button>
                            {dropdownOpen === user.user_id && (
                              <div className="absolute right-0 top-full mt-2 w-40 bg-white border rounded shadow-md z-10 whitespace-nowrap">
                                {userPermissions.includes(4) && <Link href={`/users/detail/${user.user_id}`}><button className="block w-full px-4 py-2 text-left hover:bg-gray-200">View</button></Link>}
                                {userPermissions.includes(5) && <Link href={`/users/update/${user.user_id}`}><button className="block w-full px-4 py-2 text-left hover:bg-gray-200">Update</button></Link>}
                                {userPermissions.includes(6) && <Link href={`/users/update_email/${user.user_id}`}><button className="block w-full px-4 py-2 text-left hover:bg-gray-200">Update E-mail</button></Link>}
                                {userPermissions.includes(7) && <Link href={`/users/update_password/${user.user_id}`}><button className="block w-full px-4 py-2 text-left hover:bg-gray-200">Update Password</button></Link>}
                                {userPermissions.includes(8) && <button onClick={() => handleDelete(user.user_id, user.user_code)} className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-200">Delete</button>}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {/* <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    >
                      &lt;
                    </button>
                    {getPaginationRange().map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded ${currentPage === page
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    >
                      &gt;
                    </button>
                  </div>
                </div> */}
                <Pagination currentPage={currentPage} totalPages={totalPages} handlePageChange={setCurrentPage} />

              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default UserSearch;
