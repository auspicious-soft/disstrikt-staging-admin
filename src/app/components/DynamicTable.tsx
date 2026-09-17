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
  data: any[];
  rowIcon?: string | React.ReactElement; // View icon
  onclickFunction?: (id: string) => void; // For view
  renderCell?: (row: any, key: any) => React.ReactNode;
  isEyeShow?: boolean; // Default true
  renderActions?: (row: any) => React.ReactNode;
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
  const [sort, setSort] = React.useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (key: string) => {
    setSort((currentSort) => {
      if (!currentSort || currentSort.key !== key) {
        return { key, direction: "asc" };
      }

      if (currentSort.direction === "asc") {
        return { key, direction: "desc" };
      }

      return null;
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sort) return data;

    return [...data].sort((left, right) => {
      const leftValue = left[sort.key];
      const rightValue = right[sort.key];

      if (leftValue === rightValue) return 0;
      if (leftValue === null || leftValue === undefined) return 1;
      if (rightValue === null || rightValue === undefined) return -1;

      const comparison =
        typeof leftValue === "number" && typeof rightValue === "number"
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue), undefined, {
              sensitivity: "base",
            });

      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [data, sort]);

  const columnCount =
    headers.length + ((rowIcon && isEyeShow) || renderActions ? 1 : 0);
  const defaultWidth = `${100 / columnCount}%`;
  const minTableWidth = Math.max(640, columnCount * 128);
  const headerJustifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  };

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-md">
    <table
      className="w-full rounded-md outline-1 outline-offset-[-1px] outline-stone-700 border-collapse table-fixed"
      style={{ minWidth: `${minTableWidth}px` }}
    >
      <thead>
        <tr className="h-10 border-b border-stone-700">
          {headers.map((header, index) => (
            <th
              key={index}
              aria-sort={
                sort?.key === header.key
                  ? sort.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              className={`px-5 py-px text-${header.align || "start"} ${
                header.width || defaultWidth
              } font-medium text-stone-200 text-sm  leading-tight truncate`}
            >
              <button
                type="button"
                onClick={() => handleSort(header.key)}
                disabled={!header.icon}
                className={`flex w-full items-center text-white/90 text-sm gap-1 disabled:cursor-default ${
                  headerJustifyClasses[header.align || "start"]
                }`}
              >
                <span className="truncate">{header.label}</span>
                {header.icon && (
                  <span
                    className={`relative h-4 w-4 shrink-0 ${
                      sort?.key === header.key
                        ? "text-rose-400 opacity-100"
                        : "opacity-50"
                    }`}
                    aria-hidden="true"
                  >
                    {typeof header.icon === "string" ? (
                      <img
                        src={header.icon}
                        alt={`${header.label} icon`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      header.icon
                    )}
                  </span>
                )}
              </button>
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
          sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="h-12 border-b text-white/70 border-stone-700 last:border-b-0"
            >
              {headers.map((header, colIndex) => {
                const cellContent = renderCell
                  ? renderCell(row, header.key)
                  : row[header.key];
                const shouldTruncate =
                  typeof cellContent === "string" ||
                  typeof cellContent === "number";

                return (
                  <td
                    key={colIndex}
                    className={`px-5 py-2 text-white/70 text-sm text-${header.align || "start"} ${
                      header.width || defaultWidth
                    } text-stone-200 text-sm ${
                      header.fontWeight || "font-normal"
                    }  leading-tight align-middle`}
                  >
                    {shouldTruncate ? (
                      <span className="block truncate">{cellContent}</span>
                    ) : (
                      cellContent
                    )}
                  </td>
                );
              })}

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
    </div>
  );
};

export default DynamicTable;
