// Where each role lands after login.
export const homeFor = (role) => (role === "admin" ? "/admin" : role === "delivery" ? "/delivery" : "/customer");
