import React from "react";
import { Controller } from "react-hook-form";
import {FormControl, InputBaseComponentProps, InputLabel, InputLabelProps, Select, SxProps, TextField, Theme} from "@mui/material";

interface FormSelectProps {
    name: string;
    control: any;
    label: string;
    setValue?: any;
    rules?: {
        required?: {value: boolean, message: string};
        maxLength?: number;
        minLength?: {value: number, message: string}
        pattern?: {value: RegExp, message: string}
        // add more rules as needed here.
    };
    InputLabelProps?: Partial<InputLabelProps>;
    inputProps?: InputBaseComponentProps | undefined
    sx?: SxProps<Theme>;
    children: JSX.Element[];
}

export const FormInputSelect = ({ name, control, label, rules, InputLabelProps, inputProps, sx, children }: FormSelectProps) => {
    return (
     <FormControl sx={{...sx}}>
        <InputLabel id={`label-${name}`}>{label}</InputLabel>
      <Controller
        name={name}
        control={control}
        shouldUnregister={true}
        rules={rules ? rules : {}}
        render={({field}) => (
          <Select label={label} labelId={`label-${name}`} {...field}>
            {children}
          </Select>
        )}
      />
       </FormControl>
    );
  };