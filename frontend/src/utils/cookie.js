import { jwtDecode } from "jwt-decode"

function getUserByJwtToken() {
    const token = localStorage.getItem("token");

    if (token) {
        const userDetails = jwtDecode(token);

        return userDetails;
    }
}

function IsUserAdmin(){
    const user = getUserByJwtToken();

    return user?.system_role === "Admin" || user?.system_role === "Super Admin";
}

export default IsUserAdmin;