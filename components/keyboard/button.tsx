import  {type ReactNode} from 'react';

interface ButtonProps {
    className?: string;
    onclick?: (e: React.MouseEvent<HTMLDivElement>, value: string|ReactNode) => void;
    value: string | ReactNode;
}

const Button = ({onclick,value,className}:ButtonProps) => {
    return (
        <div className={`bg-gray-100 min-h-24 hover:bg-gray-200 rounded-lg cursor-pointer flex items-center justify-center ${className}`} onClick={(e)=>onclick? onclick(e,value):null} >
            <span className="text-2xl font-bold text-[#3b5461]" >
                {value}
            </span>
        </div>
    );
};

export default Button;