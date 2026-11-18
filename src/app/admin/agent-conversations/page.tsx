"use client";

/**
 * Agent Conversations: every model's "Chat with your agent" thread in one
 * place (Messages 4.7.3). The same conversations, messages and ids as the
 * agent panel's Messages and University Union → Messages (one system, not a
 * copy): each row shows the model, their assigned agent, the latest message,
 * its time and unread count. Admins open a thread and reply; the reply goes
 * to the model's in-app chat (and notifications), and the agent sees it live.
 */
import React, { useState } from "react";
import { Search } from "lucide-react";
import CustomInput from "@/app/components/CustomInput";
import CustomSelect from "@/app/components/CustomSelect";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { useGetModelMansionAgents } from "@/hooks/useModelMansion";
import UnionMessages from "../university-union/UnionMessages";

const AgentConversationsPage: React.FC = () => {
  const [agent, setAgent] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);
  const { data: agents } = useGetModelMansionAgents();

  return (
    <div className="w-full inline-flex flex-col justify-center items-start gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-stone-400">
          Models&apos; chats with their agent. Open one to read the whole conversation and reply.
        </p>
        <div className="flex gap-2">
          <div className="w-52">
            <CustomSelect
              placeholder="Select Agent"
              options={[
                { label: "All agents", value: "" },
                { label: "Unassigned", value: "unassigned" },
                ...((agents as any[]) ?? []).map((item: any) => ({ label: item.fullName, value: item._id })),
              ]}
              value={agent}
              onChange={setAgent}
            />
          </div>
          <CustomInput
            placeholder="Search"
            icon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="w-full">
        <UnionMessages search={debouncedSearch} agent={agent} type="model" />
      </div>
    </div>
  );
};

export default AgentConversationsPage;
