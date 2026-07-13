import React from "react";
import { TableRow } from "../../types/interface-types";

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: string | React.ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}

interface DynamicTableProps {
  headers: TableHeader[];
  data: TableRow[];
  rowIcon?: string | React.ReactElement; // View icon
  onclickFunction?: (id: string) => void; // For view
  renderCell?: (row: TableRow, key: string) => React.ReactNode;
  isEyeShow?: boolean; // Default true
  renderActions?: (row: TableRow) => React.ReactNode; // ✅ NEW
  showActionsHeaderLabel?: boolean;
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  headers,
  data,
  rowIcon,
  onclickFunction,
  renderActions,
  renderCell,
  isEyeShow = true,
  showActionsHeaderLabel = true,
}) => {
  const columnCount =
    headers.length + ((rowIcon && isEyeShow) || renderActions ? 1 : 0);
  const defaultWidth = `${100 / columnCount}%`;

  return (
    <table className="w-full rounded-md outline-1 outline-offset-[-1px] outline-stone-700 border-collapse table-fixed">
      <thead>
        <tr className="h-10 border-b border-stone-700">
          {headers.map((header, index) => (
            <th
              key={index}
              className={`px-5 py-px text-${header.align || "start"} ${
                header.width || defaultWidth
              } font-medium text-stone-200 text-sm  leading-tight truncate`}
            >
              <div className="flex items-center gap-1">
                <span className="truncate">{header.label}</span>
                {header.icon && (
                  <div className="w-4 h-4 relative opacity-50">
                    {typeof header.icon === "string" ? (
                      <img
                        src={header.icon}
                        alt={`${header.label} icon`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      header.icon
                    )}
                  </div>
                )}
              </div>
            </th>
          ))}

          {(rowIcon && isEyeShow) || renderActions ? (
            <th
              aria-label="Actions"
              className="w-32 px-2 py-px text-center font-medium text-stone-200 text-sm  leading-tight"
            >
              {showActionsHeaderLabel ? "Actions" : null}
            </th>
          ) : null}
        </tr>
      </thead>

      <tbody>
        {data.length > 0 ? (
          data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="h-12 border-b border-stone-700 last:border-b-0"
            >
              {headers.map((header, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-5 py-2 text-${header.align || "start"} ${
                    header.width || defaultWidth
                  } text-stone-200 text-sm ${
                    header.fontWeight || "font-normal"
                  }  leading-tight align-middle truncate`}
                >
                  {renderCell ? renderCell(row, header.key) : row[header.key]}
                </td>
              ))}

              {(rowIcon && isEyeShow) || renderActions ? (
                <td className="w-32 px-2 py-2 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    {rowIcon && isEyeShow && (
                      <button
                        type="button"
                        onClick={() => onclickFunction?.(row._id)}
                        className="w-8 h-8 flex cursor-pointer justify-center items-center bg-neutral-800 rounded-md hover:bg-neutral-700"
                      >
                        <div className="w-4 h-4 relative">
                          {typeof rowIcon === "string" ? (
                            <img
                              src={rowIcon}
                              alt="view icon"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            rowIcon
                          )}
                        </div>
                      </button>
                    )}

                    {/* ✅ Dynamic extra actions */}
                    {renderActions?.(row)}
                  </div>
                </td>
              ) : null}
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={
                headers.length +
                ((rowIcon && isEyeShow) || renderActions ? 1 : 0)
              }
              className="text-center text-stone-400 py-6 "
            >
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default DynamicTable;
