import * as Yup from "yup";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Plan from "../../models/Plan";

interface PlanData {
  name: string;
  id?: number | string;
  users?: number;
  connections?: number;
  queues?: number;
  value?: number;
  currency?: string;
  isPublic?: boolean;
  whmcsProductId?: number;
}

const UpdatePlanService = async (planData: PlanData): Promise<Plan> => {
  const {
    id,
    name,
    users,
    connections,
    queues,
    value,
    currency,
    isPublic,
    whmcsProductId
  } = planData;

  const plan = await Plan.findByPk(id);

  if (!plan) {
    throw new AppError("ERR_NO_PLAN_FOUND", 404);
  }

  const planSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_PLAN_INVALID_NAME")
      .test("Check-unique-name", "ERR_PLAN_NAME_ALREADY_EXISTS", async val => {
        if (val) {
          const planWithSameName = await Plan.findOne({
            where: { name: val, id: { [Op.ne]: id } }
          });

          return !planWithSameName;
        }
        return true;
      })
  });

  try {
    await planSchema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await plan.update({
    name,
    users,
    connections,
    queues,
    value,
    currency,
    isPublic,
    whmcsProductId
  });

  return plan;
};

export default UpdatePlanService;
