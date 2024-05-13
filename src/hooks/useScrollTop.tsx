import { useState } from "react";

export default function useScrollTop() {
  const [scrollDown, setScrollDown] = useState<boolean>();
  const onScroll = (event: any) => {
    if (event.target.scrollTop > 0) {
      setScrollDown(true);
    } else {
      setScrollDown(false);
    }
  };
  return [scrollDown, { onScroll }];
}
