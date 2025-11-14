import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Setting from "../../models/Setting";

interface CompanyData {
  name: string;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: string;
  recurrence?: string;
  language?: string;
  whmcsClientId?: number;
}

const CreateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  const {
    name,
    phone,
    email,
    status,
    planId,
    dueDate,
    recurrence,
    language,
    whmcsClientId,
    campaignsEnabled
  } = companyData;

  const companySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_COMPANY_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const companyWithSameName = await Company.findOne({
              where: { name: value }
            });
            return !companyWithSameName;
          }
          return false;
        }
      )
  });

  try {
    await companySchema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const company = await Company.create({
    name,
    phone,
    email,
    status,
    planId,
    dueDate,
    recurrence,
    language,
    whmcsClientId
  });

  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "asaas"
    },
    defaults: {
      companyId: company.id,
      key: "asaas",
      value: ""
    }
  });

  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "CheckMsgIsGroup"
    },
    defaults: {
      companyId: company.id,
      key: "enabled",
      value: ""
    }
  });

  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "call"
    },
    defaults: {
      companyId: company.id,
      key: "call",
      value: "disabled"
    }
  });

  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "scheduleType"
    },
    defaults: {
      companyId: company.id,
      key: "scheduleType",
      value: "disabled"
    }
  });

  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "userRating"
    },
    defaults: {
      companyId: company.id,
      key: "userRating",
      value: "disabled"
    }
  });

  if (campaignsEnabled !== undefined) {
    const [setting, settingCreated] = await Setting.findOrCreate({
      where: {
        companyId: company.id,
        key: "campaignsEnabled"
      },
      defaults: {
        companyId: company.id,
        key: "campaignsEnabled",
        value: `${campaignsEnabled}`
      }
    });
    if (!settingCreated) {
      await setting.update({ value: `${campaignsEnabled}` });
    }
  }

  return company;
};

export default CreateCompanyService;
