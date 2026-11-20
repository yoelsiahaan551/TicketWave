export function resolvePostLoginRedirect(role, rawNext = "") {
  let target = "/user/home";
  if (role === "admin") {
    target = "/admin";
  } else if (role === "officer") {
    target = "/officer";
  } else {
    target = "/user/home";
  }

  const trimmed = typeof rawNext === "string" ? rawNext.trim() : "";
  const isSafePath =
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.includes("\\") &&
    !trimmed.startsWith("/login") &&
    !trimmed.startsWith("/register");

  if (!isSafePath) {
    return target;
  }

  if (role === "admin" && trimmed.startsWith("/admin")) {
    return trimmed;
  }
  if (role === "officer" && trimmed.startsWith("/officer")) {
    return trimmed;
  }
  if (
    role === "user" &&
    (trimmed === "/user" ||
      trimmed.startsWith("/user/") ||
      trimmed.startsWith("/payment/"))
  ) {
    return trimmed;
  }

  return target;
}
