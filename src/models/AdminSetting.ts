export interface AdminSettingDto {
  id: number
  companyName: string
  siteName: string
  hotline: string
  logoUrl: string
  taxCode: string
  businessAddress: string
}

export interface UpsertAdminSettingCommand {
  companyName: string
  siteName: string
  hotline: string
  logoUrl: string
  taxCode: string
  businessAddress: string
}

export const EMPTY_ADMIN_SETTING_COMMAND: UpsertAdminSettingCommand = {
  companyName: '',
  siteName: '',
  hotline: '',
  logoUrl: '',
  taxCode: '',
  businessAddress: '',
}
