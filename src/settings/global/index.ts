import { createGlobalSetting } from "./base";

export const LocaleGlobalSetting = createGlobalSetting<string>("locale");

export const DateFormatGlobalSetting = createGlobalSetting<string>("dateFormat");

export const TimeFormatGlobalSetting = createGlobalSetting<string>("timeFormat");

export const ProfileDirGlobalSetting = createGlobalSetting<string>("profileDir");
