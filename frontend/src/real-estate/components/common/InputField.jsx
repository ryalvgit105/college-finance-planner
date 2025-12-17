import React from 'react';

const InputField = ({ label, id, value, onChange, type = 'text', step, prefix, suffix, description, error, children }) => {

    if (children) {
        return (
            <div>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    {prefix && <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 sm:text-sm">{prefix}</span>}
                    {React.cloneElement(children, { id, value, onChange, className: `w-full p-2 border rounded-md ${prefix ? 'pl-7' : ''} ${error ? 'border-red-500' : 'border-gray-300'}` })}
                </div>
                {description && !error && <p className="mt-2 text-xs text-gray-500">{description}</p>}
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        )
    }

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                {prefix && <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center"><span className="text-gray-500 sm:text-sm">{prefix}</span></div>}
                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    step={step}
                    className={`w-full p-2 border rounded-md ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-12' : ''} ${error ? 'border-red-500' : 'border-gray-300'}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                />
                {suffix && <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center"><span className="text-gray-500 sm:text-sm">{suffix}</span></div>}
            </div>
            {description && !error && <p className="mt-2 text-xs text-gray-500">{description}</p>}
            {error && <p id={`${id}-error`} className="mt-2 text-xs text-red-600" role="alert">{error}</p>}
        </div>
    )
};

export default InputField;
