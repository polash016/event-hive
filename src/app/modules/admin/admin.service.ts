import { Admin, Prisma, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { adminSearchFields } from "./admin.constant";
import calculatePagination from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { TAdminFilterRequest } from "./admin.interface";
import { TPaginationOptions } from "../../interfaces/pagination";



const getAllAdmin = async (
  params: TAdminFilterRequest,
  options: TPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } = calculatePagination(options);
  const andConditions: Prisma.AdminWhereInput[] = [];

  const { searchTerm, ...filterData } = params;

  if (params.searchTerm) {
    andConditions.push({
      OR: adminSearchFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.AdminWhereInput = { AND: andConditions };
  const result = await prisma.admin.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.admin.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleAdmin = async (id: string): Promise<Admin | null> => {
  const result = await prisma.admin.findUniqueOrThrow({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  return result;
};

const updateAdmin = async (
  id: string,
  payload: Partial<Admin>
): Promise<Admin | null> => {
  const result = await prisma.admin.update({
    where: {
      id: id,
      isDeleted: false,
    },
    data: payload,
  });

  return result;
};

const deleteAdmin = async (id: string) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.$transaction(async (trans) => {
    const adminDelete = await trans.admin.delete({
      where: {
        id: id,
      },
    });

    await trans.user.delete({
      where: {
        email: adminDelete.email,
      },
    });

    return adminDelete;
  });

  return result;
};

const softDeleteAdmin = async (id: string) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (trans) => {
    const adminDelete = await trans.admin.update({
      where: {
        id: id,
      },
      data: { isDeleted: true },
    });

    await trans.user.update({
      where: {
        email: adminDelete.email,
      },
      data: { status: UserStatus.DELETED },
    });

    return adminDelete;
  });

  return result;
};

export const adminServices = {
  getAllAdmin,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
  softDeleteAdmin
};
