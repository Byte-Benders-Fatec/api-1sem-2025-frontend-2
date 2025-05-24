import { jwtDecode } from "jwt-decode"

function GetUserByJwtToken() {
    const token = localStorage.getItem("token");

    if (token) {
        const userDetails = jwtDecode(token);

        return userDetails;
    }
}

function IsUserAdmin(){
    const user = GetUserByJwtToken();

    return user?.system_role === "Admin" || user?.system_role === "Super Admin";
}

export { GetUserByJwtToken, IsUserAdmin };