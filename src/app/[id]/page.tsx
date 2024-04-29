'use client';

import {useEffect, useState} from 'react';

export default function Page({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState<Title>();

  useEffect(() => {
    void fetch(`/api/title?catalogueId=${params.id}&materialType=NEWSPAPER`)
      .then(response => response.json())
      .then((data: Title) => setTitle(data));
  }, [params]);

  return (
    <div>
      {title ? (
        <div>
          <h1>{title.name}</h1>
          <p>{title.catalogueId}</p>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}