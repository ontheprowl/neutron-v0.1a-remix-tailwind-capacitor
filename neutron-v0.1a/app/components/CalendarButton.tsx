import * as React from "react";
import { UIStore } from "../stores/UIStore";

export default function CalendarButton() {
  return (
    <button
      className="pl-2 pt-1"
      onClick={() => {
        UIStore.update((s) => {
          s.selectedTab = "Calendar";
        });
      }}
    >
      <svg
        width="29"
        height="29"
        viewBox="0 0 29 29"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21.8372 3.93945C23.6321 3.93945 25.0872 5.39452 25.0872 7.18945V22.6895C25.0872 24.4844 23.6321 25.9395 21.8372 25.9395H6.33716C4.54223 25.9395 3.08716 24.4844 3.08716 22.6895V7.18945C3.08716 5.39452 4.54223 3.93945 6.33716 3.93945H21.8372ZM8.58716 16.4395C7.75873 16.4395 7.08716 17.1111 7.08716 17.9395C7.08716 18.7679 7.75873 19.4395 8.58716 19.4395C9.41559 19.4395 10.0872 18.7679 10.0872 17.9395C10.0872 17.1111 9.41559 16.4395 8.58716 16.4395ZM14.0872 16.4395C13.2588 16.4395 12.5872 17.1111 12.5872 17.9395C12.5872 18.7679 13.2588 19.4395 14.0872 19.4395C14.9156 19.4395 15.5872 18.7679 15.5872 17.9395C15.5872 17.1111 14.9156 16.4395 14.0872 16.4395ZM8.58716 10.4395C7.75873 10.4395 7.08716 11.1111 7.08716 11.9395C7.08716 12.7679 7.75873 13.4395 8.58716 13.4395C9.41559 13.4395 10.0872 12.7679 10.0872 11.9395C10.0872 11.1111 9.41559 10.4395 8.58716 10.4395ZM14.0872 10.4395C13.2588 10.4395 12.5872 11.1111 12.5872 11.9395C12.5872 12.7679 13.2588 13.4395 14.0872 13.4395C14.9156 13.4395 15.5872 12.7679 15.5872 11.9395C15.5872 11.1111 14.9156 10.4395 14.0872 10.4395ZM19.5872 10.4395C18.7588 10.4395 18.0872 11.1111 18.0872 11.9395C18.0872 12.7679 18.7588 13.4395 19.5872 13.4395C20.4156 13.4395 21.0872 12.7679 21.0872 11.9395C21.0872 11.1111 20.4156 10.4395 19.5872 10.4395Z"
          fill="white"
        />
      </svg>
    </button>
  );
}
