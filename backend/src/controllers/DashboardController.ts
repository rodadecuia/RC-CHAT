import { Request, Response } from "express";

import {
  DashboardDateRange,
  statusSummaryService,
  ticketsStatisticsService,
  usersReportService,
  ratingsReportService,
  contactsReportService,
} from "../services/ReportService/DashboardService";

export const ticketsStatistic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params: DashboardDateRange = req.query;
  const { companyId } = req.user;

  const result = await ticketsStatisticsService(companyId, params);
  return res.status(200).json(result);
};

export const usersReport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params: DashboardDateRange = req.query;
  const { companyId } = req.user;

  const result = await usersReportService(companyId, params);
  return res.status(200).json(result);
};

export const statusSummary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const dashboardData = await statusSummaryService(companyId);
  return res.status(200).json(dashboardData);
};

export const ratingsReport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params: DashboardDateRange = req.query;
  const { companyId } = req.user;

  const result = await ratingsReportService(companyId, params);
  return res.status(200).json(result);
};

export const contactsReport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params: DashboardDateRange = req.query;
  const { companyId } = req.user;

  const result = await contactsReportService(companyId, params);
  return res.status(200).json(result);
};
