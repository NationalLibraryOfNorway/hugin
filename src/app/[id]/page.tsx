'use client';

import {useEffect, useState} from 'react';
import {fetchNewspaperTitle} from '@/services/data';
import {Title} from '@/models/Title';

export default function Page({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState<Title>();

  useEffect(() => {
    void fetchNewspaperTitle(params.id).then((data: Title) => setTitle(data));
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