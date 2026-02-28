import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => {
    return twMerge(clsx(inputs));
};

export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn("skeleton-loading rounded-md", className)}
            {...props}
        />
    );
};
