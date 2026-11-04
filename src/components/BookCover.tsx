"use client";

import React, { useState } from "react";

type BookCoverProps = {
title: string;
author: string;
isbn: string;
coverImage?: string;
};

export default function BookCover({
title,
author,
isbn,
coverImage,
}: BookCoverProps) {
const [fallback, setFallback] = useState(false);

const coverUrl =
coverImage ||
(isbn
? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`
: "");

return ( <div className="flex h-72 w-full items-center justify-center overflow-hidden bg-transparent">
{coverUrl && !fallback ? (
<img
src={coverUrl}
alt={`Cover of ${title}`}
loading="lazy"
className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
onError={() => setFallback(true)}
/>
) : ( <div className="flex h-64 w-44 flex-col items-center justify-between rounded-md bg-[#193B32] p-5 text-center text-white shadow-lg"> <span className="text-[9px] tracking-widest text-[#D5B77B]">
BOOKNOOK COLLECTION </span>


      <span className="font-serif text-xl font-semibold">
        {title}
      </span>

      <span className="text-xs">{author}</span>
    </div>
  )}
</div>

);
}
