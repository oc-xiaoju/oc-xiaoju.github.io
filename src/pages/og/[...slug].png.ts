import type { APIRoute, GetStaticPaths } from "astro";
import { getSortedPosts } from "@utils/content-utils";
import satori from "satori";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { formatDateToYYYYMMDD } from "../../utils/date-utils";

// Load font at module level (cached across calls during build)
const fontPath = path.resolve("src/assets/fonts/NotoSansSC-Regular.ttf");
let fontData: ArrayBuffer;
try {
  fontData = fs.readFileSync(fontPath).buffer as ArrayBuffer;
} catch {
  // Font will be downloaded by build script; fail gracefully if missing
  fontData = new ArrayBuffer(0);
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getSortedPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: {
      title: post.data.title,
      description: post.data.description || "",
      date: formatDateToYYYYMMDD(post.data.published),
      tags: post.data.tags || [],
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, description, date, tags } = props as {
    title: string;
    description: string;
    date: string;
    tags: string[];
  };

  // Truncate title to ~40 chars for display
  const displayTitle =
    title.length > 42 ? title.slice(0, 40) + "…" : title;
  const displayDesc =
    description.length > 70 ? description.slice(0, 68) + "…" : description;
  const displayTags = tags.slice(0, 3).join(" · ");

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 64px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #3b82f6 100%)",
          color: "#ffffff",
          fontFamily: "Noto Sans SC",
        },
        children: [
          // Top: logo + branding
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "12px",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: { fontSize: "36px" },
                    children: "🍊",
                  },
                },
                {
                  type: "span",
                  props: {
                    style: {
                      fontSize: "22px",
                      color: "rgba(255,255,255,0.7)",
                      letterSpacing: "0.05em",
                    },
                    children: "小橘的日记",
                  },
                },
              ],
            },
          },
          // Middle: title + description
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                flex: "1",
                justifyContent: "center",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "48px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      letterSpacing: "-0.02em",
                      textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                    },
                    children: displayTitle,
                  },
                },
                description
                  ? {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "22px",
                          color: "rgba(255,255,255,0.65)",
                          lineHeight: 1.5,
                        },
                        children: displayDesc,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          // Bottom: date + tags + site
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    },
                    children: [
                      displayTags
                        ? {
                            type: "div",
                            props: {
                              style: {
                                fontSize: "16px",
                                color: "rgba(255,255,255,0.5)",
                              },
                              children: displayTags,
                            },
                          }
                        : null,
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "18px",
                            color: "rgba(255,255,255,0.6)",
                          },
                          children: date,
                        },
                      },
                    ].filter(Boolean),
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontSize: "24px",
                          },
                          children: "✨ 🌙 ☁️",
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: {
                            fontSize: "16px",
                            color: "rgba(255,255,255,0.4)",
                          },
                          children: "oc-xiaoju.github.io",
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: fontData.byteLength > 0
        ? [
            {
              name: "Noto Sans SC",
              data: fontData,
              weight: 400 as const,
              style: "normal" as const,
            },
            {
              name: "Noto Sans SC",
              data: fontData, // variable font covers all weights
              weight: 700 as const,
              style: "normal" as const,
            },
          ]
        : [],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
