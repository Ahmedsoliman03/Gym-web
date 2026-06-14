'use client';

import { useEffect, useRef } from 'react';
import { useFormikContext } from 'formik';

/**
 * Drop inside any Formik `<Form>` to validate in real time *while typing*.
 *
 * By default Formik's `<ErrorMessage>` only shows a field's error once that
 * field has been blurred (`touched`). This watches the form values and marks
 * each field `touched` the moment its value first changes, so the error for
 * that field appears as the user types — without surfacing errors on fields
 * they haven't interacted with yet.
 */
export function LiveValidate() {
    const { values, touched, setFieldTouched } = useFormikContext<Record<string, unknown>>();
    const prevValues = useRef(values);

    useEffect(() => {
        const prev = prevValues.current;
        prevValues.current = values;

        for (const key of Object.keys(values)) {
            const changed = values[key] !== prev[key];
            if (changed && !touched[key]) {
                // `true` for shouldValidate so the error is recomputed and
                // shown on this keystroke rather than the next one.
                setFieldTouched(key, true, true);
            }
        }
    }, [values, touched, setFieldTouched]);

    return null;
}
