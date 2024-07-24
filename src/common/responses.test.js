import { groupByType, groupByTypeBytes } from './responses.js'

describe('Responses', () => {
  test('should…', () => {
    const responses = [
      {
        url: "http://localhost:3007/read-fieldnotes",
        contentType: "text/html; charset=utf-8",
        compressedBytes: 12268,
        uncompressedBytes: 12268,
        encoding: "n/a",
        resourceType: "document",
        bytes: 12268,
      },
      {
        url: "http://localhost:3007/read-fieldnotes.cef13b7e.js",
        contentType: "application/javascript; charset=utf-8",
        compressedBytes: 1842446,
        uncompressedBytes: 1842446,
        encoding: "n/a",
        resourceType: "script",
        bytes: 1842446,
      },
      {
        url: "http://localhost:3007/read-fieldnotes.e0093be9.css",
        contentType: "text/css; charset=utf-8",
        compressedBytes: 492,
        uncompressedBytes: 492,
        encoding: "n/a",
        resourceType: "stylesheet",
        bytes: 492,
      },
      {
        url: "http://localhost:3007/read-fieldnotes.c180ac0f.css",
        contentType: "text/css; charset=utf-8",
        compressedBytes: 17286,
        uncompressedBytes: 17286,
        encoding: "n/a",
        resourceType: "stylesheet",
        bytes: 17286,
      },
      {
        url: "http://localhost:3007/read-fieldnotes.32592dc1.js",
        contentType: "application/javascript; charset=utf-8",
        compressedBytes: 124636,
        uncompressedBytes: 124636,
        encoding: "n/a",
        resourceType: "script",
        bytes: 124636,
      },
      {
        url: "http://localhost:3007/favicon.956925d8.ico",
        contentType: "image/x-icon",
        compressedBytes: 318,
        uncompressedBytes: 318,
        encoding: "n/a",
        resourceType: "other",
        bytes: 318,
      },
      {
        url: "https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?VER=8&database=projects%2Ffieldnotes-13578%2Fdatabases%2F(default)&RID=46359&CVER=22&X-HTTP-Session-Id=gsessionid&zx=1uid4zwgi5yl&t=1",
        contentType: "text/plain; charset=utf-8",
        compressedBytes: 71,
        uncompressedBytes: 54,
        encoding: "gzip",
        resourceType: "fetch",
        bytes: 71,
      },
      {
        url: "https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?VER=8&database=projects%2Ffieldnotes-13578%2Fdatabases%2F(default)&gsessionid=WSFtyQlaj7NcO63IsCIYI39ySabK_-EsoGZLl5SOh5U&SID=gJnQq4PaBFKHGzzd6NIh0w&RID=46360&AID=10&zx=xuxi9s4a7jd&t=1",
        contentType: "text/plain; charset=utf-8",
        compressedBytes: 31,
        uncompressedBytes: 11,
        encoding: "gzip",
        resourceType: "fetch",
        bytes: 31,
      },
    ]
    const groupedByType = groupByType(responses)
    const expectedGroupedByType = {
      document: [
        {
          url: "http://localhost:3007/read-fieldnotes",
          contentType: "text/html; charset=utf-8",
          compressedBytes: 12268,
          uncompressedBytes: 12268,
          encoding: "n/a",
          bytes: 12268,
        },
      ],
      script: [
        {
          url: "http://localhost:3007/read-fieldnotes.cef13b7e.js",
          contentType: "application/javascript; charset=utf-8",
          compressedBytes: 1842446,
          uncompressedBytes: 1842446,
          encoding: "n/a",
          bytes: 1842446,
        },
        {
          url: "http://localhost:3007/read-fieldnotes.32592dc1.js",
          contentType: "application/javascript; charset=utf-8",
          compressedBytes: 124636,
          uncompressedBytes: 124636,
          encoding: "n/a",
          bytes: 124636,
        },
      ],
      stylesheet: [
        {
          url: "http://localhost:3007/read-fieldnotes.e0093be9.css",
          contentType: "text/css; charset=utf-8",
          compressedBytes: 492,
          uncompressedBytes: 492,
          encoding: "n/a",
          bytes: 492,
        },
        {
          url: "http://localhost:3007/read-fieldnotes.c180ac0f.css",
          contentType: "text/css; charset=utf-8",
          compressedBytes: 17286,
          uncompressedBytes: 17286,
          encoding: "n/a",
          bytes: 17286,
        },
      ],
      other: [
        {
          url: "http://localhost:3007/favicon.956925d8.ico",
          contentType: "image/x-icon",
          compressedBytes: 318,
          uncompressedBytes: 318,
          encoding: "n/a",
          bytes: 318,
        },
      ],
      fetch: [
        {
          url: "https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?VER=8&database=projects%2Ffieldnotes-13578%2Fdatabases%2F(default)&RID=46359&CVER=22&X-HTTP-Session-Id=gsessionid&zx=1uid4zwgi5yl&t=1",
          contentType: "text/plain; charset=utf-8",
          compressedBytes: 71,
          uncompressedBytes: 54,
          encoding: "gzip",
          bytes: 71,
        },
        {
          url: "https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?VER=8&database=projects%2Ffieldnotes-13578%2Fdatabases%2F(default)&gsessionid=WSFtyQlaj7NcO63IsCIYI39ySabK_-EsoGZLl5SOh5U&SID=gJnQq4PaBFKHGzzd6NIh0w&RID=46360&AID=10&zx=xuxi9s4a7jd&t=1",
          contentType: "text/plain; charset=utf-8",
          compressedBytes: 31,
          uncompressedBytes: 11,
          encoding: "gzip",
          bytes: 31,
        },
      ],
    }
    expect(groupedByType).toEqual(expectedGroupedByType)
    const groupedByTypeBytes = groupByTypeBytes(expectedGroupedByType)
    const expectedGroupedByTypeBytes = [
      {
        type: "document",
        bytes: 12268,
        uncachedBytes: 12268,
        count: 1,
      },
      {
        type: "script",
        bytes: 1967082,
        uncachedBytes: 1967082,
        count: 2,
      },
      {
        type: "stylesheet",
        bytes: 17778,
        uncachedBytes: 17778,
        count: 2,
      },
      {
        type: "other",
        bytes: 318,
        uncachedBytes: 318,
        count: 1,
      },
      {
        type: "fetch",
        bytes: 102,
        uncachedBytes: 65,
        count: 2,
      },
    ]
    expect(groupedByTypeBytes).toEqual(expectedGroupedByTypeBytes)
  })
})