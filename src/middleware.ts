import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth/signin",
    },
});

export const config = {
    matcher: ["/:path*"],
  };  

// หน้าที่ต้องให้ login ก่อน
// export const config = {
//     matcher: ["/dashboard/:path*", "/users/:path*"],
// };


// หน้าที่ไม่ต้องให้ login
// export const config = {
//     matcher: ["/((?!roles/create|departments|public|api/public).*)"],
// };