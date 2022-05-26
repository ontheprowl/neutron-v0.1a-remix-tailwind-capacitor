
import { useNavigate } from "@remix-run/react";
import * as React from "react";
import { UIStore } from "../stores/UIStore";

export default function HomeButton() {

  let navigate = useNavigate();
  return (
    <button
      className="pl-1 pt-1"
      onClick={() => {
        UIStore.update((s) => {
          s.selectedTab = "Home";
        });
        navigate('dashboard')
        

      }}
    >
      <svg
        width="29"
        height="24"
        viewBox="0 0 21 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.69082 1.35505C9.50667 0.689918 10.6677 0.689918 11.4836 1.35505L19.169 7.62089C19.6968 8.05115 20.0039 8.70157 20.0039 9.3892V20.7557C20.0039 22.0078 19.0049 23.0229 17.7726 23.0229H14.7976C13.5653 23.0229 12.5664 22.0078 12.5664 20.7557V15.2932C12.5664 14.8759 12.2334 14.5375 11.8226 14.5375H8.35178C7.941 14.5375 7.60803 14.8759 7.60803 15.2932V20.7557C7.60803 22.0078 6.60907 23.0229 5.37678 23.0229H2.40178C1.1695 23.0229 0.170532 22.0078 0.170532 20.7557V9.3892C0.170532 8.70163 0.477628 8.05115 1.00542 7.62089L8.69082 1.35505Z"
          fill="white"
        />
      </svg>
    </button>
  );
}
