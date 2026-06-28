'use client';

import { useEffect, useRef } from 'react';
import { useFormikContext } from 'formik';


export function LiveValidate() {
    const { values, touched, setFieldTouched } = useFormikContext<Record<string, unknown>>();
    const prevValues = useRef(values);

    useEffect(() => {
        const prev = prevValues.current;
        prevValues.current = values;

        for (const key of Object.keys(values)) {
            const changed = values[key] !== prev[key];
            if (changed && !touched[key]) {

                setFieldTouched(key, true, true);
            }
        }
    }, [values, touched, setFieldTouched]);

    return null;
}
