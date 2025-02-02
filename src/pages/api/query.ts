import { NextApiRequest, NextApiResponse } from "next";

import { PostWhereInput } from "@prisma/client/generator-build";
import { getServerSession } from "next-auth";
import { withSentry } from "@sentry/nextjs";
import authOptions from "./auth/options";
import { prisma } from "../../db/prisma";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const {
    order,
    codeHash,
    userId,
    days,
    starredBy,
    featured,
    skip,
    take,
    id,
    children,
  } = request.query;

  const idInt = parseInt(id as string);

  const session = await getServerSession(
    { req: request, res: response },
    authOptions
  );
  // const userId = session.userId as string;

  let orderBy: PostWhereInput = { createdAt: "desc" };
  if (order === "top") {
    orderBy = { stars: { _count: "desc" } };
  }
  let where: PostWhereInput = {
    userId: {
      not: {
        equals: null,
      },
    },
  };
  if (codeHash) {
    where = {
      codeHash,
    };
  }
  where.public = {
    equals: true,
  };
  if (featured === "true") {
    where.NOT = [
      {
        featuredAt: {
          equals: null,
        },
      },
    ];
    if (order !== "top") {
      orderBy = { featuredAt: "desc" };
    }
  }
  if (userId) {
    where = {
      userId,
    };
  }
  if (!isNaN(idInt)) {
    where = {
      id: idInt,
    };
  }
  if (children && !isNaN(idInt)) {
    where = {
      parentId: idInt,
      //public: true,
    };
  }
  if (starredBy) {
    where = {
      stars: {
        some: {
          userId: starredBy,
        },
      },
      public: { equals: true },
    };
  }

  if (days) {
    where.createdAt = {
      gte: new Date(
        Date.now() - parseInt(days as string, 10) * 24 * 60 * 60 * 1000
      ),
    };
  }
  const skipN = parseInt(skip as string, 10) || 0;
  try {
    // todo cursor based pagination
    let posts = await prisma.post.findMany({
      take: parseInt(take as string, 10) || 50,
      skip: skipN,
      where,
      orderBy,
      select: {
        id: true,
        createdAt: true,
        title: true,
        views: true,
        metadata: true,
        codeHash: true,
        public: true,
        _count: {
          select: { stars: true },
        },
        stars: {
          where: {
            userId: session?.userId ?? "-1",
          },
        },
        parent: {
          select: {
            id: true,
            public: true,
          },
        },
        children: {
          select: {
            id: true,
            public: true,
          },
        },
        user: { select: { id: true, name: true, image: true } },
        featuredAt: true,
      },
    });

    response.status(200).json({ posts, offset: skipN + posts.length });
  } catch (err) {
    throw err;
  }
}

export default withSentry(handler);
