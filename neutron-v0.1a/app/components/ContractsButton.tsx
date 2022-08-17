import * as React from "react";
import { UIStore } from "../stores/UIStore";

import { useNavigate } from "@remix-run/react";

export default function ContractsButton() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 17L12 22L22 17M2 12L12 17L22 12M12 2L2 7L12 12L22 7L12 2Z" stroke="#D0D5DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
