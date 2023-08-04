import React from "react";
import { Controller } from "react-hook-form";
import {InputBaseComponentProps, InputLabelProps, SxProps, TextField, Theme} from "@mui/material";

interface FormInputProps {
    name: string;
    control: any;
    label: string;
    setValue?: any;
    minRows?: number;
    rules?: {
        required?: {value: boolean, message: string};
        maxLength?: number;
        minLength?: {value: number, message: string}
        pattern?: {value: RegExp, message: string}
        // add more rules as needed here.
    };
    type?: React.InputHTMLAttributes<unknown>['type'];
    InputLabelProps?: Partial<InputLabelProps>;
    inputProps?: InputBaseComponentProps | undefined
    sx?: SxProps<Theme>;
}

export const FormInputText = ({ name, control, label, rules, minRows, type, InputLabelProps, inputProps, sx }: FormInputProps) => {
    return (
      <Controller
        name={name}
        control={control}
        shouldUnregister={true}
        rules={rules ? rules : {}}
        render={({
          field: { onChange, value },
          fieldState: { error },
          formState,
        }) => (
          <TextField
            sx={{
                paddingBottom: "20px",
                ...sx
            }}
            helperText={error ? error.message : null}
            // size="small"
            error={!!error}
            onChange={onChange}
            minRows={minRows ?? 1}
            multiline={minRows ? true : false}
            value={value ?? ""}
            fullWidth
            name={name}
            type={type ?? "text"}
            label={label}
            variant="outlined"
            InputLabelProps={{...InputLabelProps}}
            inputProps={{...inputProps}}
          />
        )}
      />
    );
  };