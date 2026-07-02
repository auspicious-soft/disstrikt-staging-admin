"use client";
import { Editor } from "@tinymce/tinymce-react";
import React, { useRef, useState, useEffect } from "react";
import { Editor as TinyMCEEditor } from "tinymce";
import { ChevronUp, ChevronDown } from "lucide-react";

interface TextEditorProps {
  value?: string;
  setDescription: (content: string) => void;
  language: string;
}

export const TextEditor = ({
  value = "",
  setDescription,
  language,
}: TextEditorProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(language === "English");
  const [editorError, setEditorError] = useState<string | null>(null);
  const editorRef = useRef<TinyMCEEditor | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleEditor = () => {
    setIsOpen(!isOpen);
  };

  const handleEditorChange = (content: string) => {
    setDescription(content);
  };

  const handleEditorInit = (evt: any, editor: TinyMCEEditor) => {
    editorRef.current = editor;
    if (
      editor.iframeElement?.contentDocument?.body.innerHTML.includes(
        "not registered",
      )
    ) {
      setEditorError(
        "TinyMCE domain not registered. Please add this domain to the TinyMCE Customer Portal.",
      );
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="self-stretch p-4 bg-zinc-900/80 rounded-[10px] outline outline-offset-[-1px] outline-neutral-700 inline-flex justify-start items-center gap-2.5">
      <div className="flex-1 inline-flex flex-col justify-start items-start gap-10">
        <div
          className="self-stretch flex flex-col justify-start items-start gap-5"
          onClick={toggleEditor}
        >
          <div className="self-stretch inline-flex justify-between items-start">
            <div className="justify-start text-stone-200 text-base font-semibold ">
              {language}
            </div>
            <div
              className="w-5 h-5 relative origin-top-left cursor-pointer"
              onClick={toggleEditor}
            >
              {isOpen ? (
                <ChevronUp className="w-5 h-5 transition-transform duration-300 ease-in-out" />
              ) : (
                <ChevronDown className="w-5 h-5 transition-transform duration-300 ease-in-out" />
              )}
            </div>
          </div>
          <div
            className={`self-stretch overflow-hidden transition-all duration-300 ease-in-out ${
              isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {isOpen && (
              <>
                {editorError ? (
                  <div className="text-red-500 text-sm font-normal ">
                    {editorError}
                  </div>
                ) : (
                  <Editor
                    apiKey="bfiif5l897h0tnz5633ntzuzxtnccbq360798pls2ilxjs0o"
                    value={value}
                    onInit={handleEditorInit}
                    init={{
                      height: 300,
                      width: "100%",
                      menubar: false,
                      statusbar: false,
                      plugins: "table",
                      toolbar:
                        "fontfamily fontsizeinput blocks forecolor bold italic underline alignleft aligncenter alignright undo redo | table",
                      toolbar_location: "top",
                      content_css: "",
                      font_family_formats:
                        "Normal=arial,helvetica,sans-serif;" +
                        "Sans Serif=sans-serif;" +
                        "Serif=serif;" +
                        "Monospace=monospace",
                      content_style: `
                        body { 
                          font-family: arial,helvetica,sans-serif;
                          font-size: 14px;
                          margin: 0;
                          padding: 16px;
                          background-color: #27272a !important; 
                          color: #e4e4e7; 
                        }
                        table {
                          border-collapse: collapse;
                          width: 100%;
                          border-color: #4b5563;
                        }
                        th, td {
                          border: 1px solid #4b5563;
                          padding: 8px;
                        }
                        th {
                          background-color: #3f3f46; 
                          color: #e4e4e7;
                        }
                        p, span, div {
                          color: #e4e4e7;
                        }
                      `,
                      setup: (editor) => {
                        editor.on("init", () => {
                          const doc = document;
                          const style = doc.createElement("style");
                          style.textContent = `
                            .tox-editor-header,
                            .tox-toolbar,
                            .tox-toolbar__primary,
                            .tox-toolbar-overlord,
                            .tox-toolbar__group {
                              background-color: #27272a !important;
                              border: none !important; 
                            }
                            .tox-tbtn,
                            .tox-tbtn__select-label,
                            .tox-tbtn__icon,
                            .tox-selectfield select,
                            .tox-selectfield select option {
                              color: #000000 !important;
                            }
                            .tox-tbtn svg,
                            .tox-tbtn__icon svg {
                              fill: #000000 !important;
                            }
                            .tox-tbtn:hover,
                            .tox-tbtn:focus,
                            .tox-tbtn--enabled,
                            .tox-tbtn--enabled:hover,
                            .tox-tbtn--enabled:focus {
                              background-color: #3f3f46 !important;
                              color: #000000 !important;
                            }
                              .tox, .tox-tinymce{
                              border:0px 
                              }
                              .tox-tbtn, .tox-tbtn--select , .tox-tbtn--disabled, .tox-number-input{
                               background-color: #3f3f46 !important;
                              color: #000000 !important; 
                              }
                              .tok-number-input:hover{
                               background-color: #3f3f46 !important; 
                              color: #000000 !important; 
                              }
                              .minus, .tox-input-wrapper, .plus{
                                background-color: #3f3f46 !important;
                              color: #000000 !important; 
                              }
                                .minus:hover, .tox-input-wrapper:hover, .plus:hover{
                                
                              color: #000000 !important; 
                              }

                              .top-input-wrapper input{
                               background-color: #3f3f46 !important; 
                              color: #000000 !important; 
                              }
                          `;
                          doc.head.appendChild(style);
                        });
                      },
                      browser_spellcheck: true,
                    }}
                    onEditorChange={handleEditorChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ContactEditorProps {
  value: string;
  setDescription: (content: string) => void;
  label: string;
  type?: "text" | "tel";
}

const ContactEditor = ({
  value,
  setDescription,
  label,
  type = "text",
}: ContactEditorProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <label className="text-sm text-stone-300 font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={handleInputChange}
        className="w-full p-2 bg-[#27272a] text-[#e4e4e7] border border-[#4b5563] rounded-[5px] focus:outline-none focus:ring-2 focus:ring-rose-500"
      />
    </div>
  );
};

interface ContactGroupProps {
  label: string;
  children: React.ReactNode;
}

const ContactGroup = ({ label, children }: ContactGroupProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="self-stretch p-4 bg-zinc-900/80 rounded-[10px] outline outline-offset-[-1px] outline-neutral-700 flex flex-col gap-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-stone-200 text-base font-semibold ">{label}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </div>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden flex flex-col gap-3`}
      >
        {children}
      </div>
    </div>
  );
};

interface MultiTextEditorsProps {
  activeTab: string;
  values: {
    privacyPolicy: { en: string; nl: string; es: string; fr: string };
    termAndCondition: { en: string; nl: string; es: string; fr: string };
    support: {
      phone: { UK: string; BE: string; FR: string; ES: string; NL: string };
      email: { UK: string; BE: string; FR: string; ES: string; NL: string };
      address: { en: string; nl: string; es: string; fr: string };
    };
  };
  setDescriptions: {
    setPrivacyPolicy: {
      setEnglish: (content: string) => void;
      setDutch: (content: string) => void;
      setSpanish: (content: string) => void;
      setFrench: (content: string) => void;
    };
    setTermAndCondition: {
      setEnglish: (content: string) => void;
      setDutch: (content: string) => void;
      setSpanish: (content: string) => void;
      setFrench: (content: string) => void;
    };
    setSupport: {
      setPhone: (
        country: keyof MultiTextEditorsProps["values"]["support"]["phone"],
        content: string,
      ) => void;
      setEmail: (
        country: keyof MultiTextEditorsProps["values"]["support"]["email"],
        content: string,
      ) => void;
      setAddressEnglish: (content: string) => void;
      setAddressDutch: (content: string) => void;
      setAddressSpanish: (content: string) => void;
      setAddressFrench: (content: string) => void;
    };
  };
}

const MultiTextEditors = ({
  activeTab,
  values,
  setDescriptions,
}: MultiTextEditorsProps) => {
  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-5">
      {activeTab === "privacy" && (
        <>
          <TextEditor
            language="English"
            value={values.privacyPolicy.en}
            setDescription={setDescriptions.setPrivacyPolicy.setEnglish}
          />
          <TextEditor
            language="Dutch"
            value={values.privacyPolicy.nl}
            setDescription={setDescriptions.setPrivacyPolicy.setDutch}
          />
          <TextEditor
            language="Spanish"
            value={values.privacyPolicy.es}
            setDescription={setDescriptions.setPrivacyPolicy.setSpanish}
          />
          <TextEditor
            language="French"
            value={values.privacyPolicy.fr}
            setDescription={setDescriptions.setPrivacyPolicy.setFrench}
          />
        </>
      )}
      {activeTab === "terms" && (
        <>
          <TextEditor
            language="English"
            value={values.termAndCondition.en}
            setDescription={setDescriptions.setTermAndCondition.setEnglish}
          />
          <TextEditor
            language="Dutch"
            value={values.termAndCondition.nl}
            setDescription={setDescriptions.setTermAndCondition.setDutch}
          />
          <TextEditor
            language="Spanish"
            value={values.termAndCondition.es}
            setDescription={setDescriptions.setTermAndCondition.setSpanish}
          />
          <TextEditor
            language="French"
            value={values.termAndCondition.fr}
            setDescription={setDescriptions.setTermAndCondition.setFrench}
          />
        </>
      )}
      {activeTab === "contact" && (
        <>
          <ContactGroup label="Phone">
            <ContactEditor
              type="tel"
              label="USA"
              value={values.support.phone.UK}
              setDescription={(val) =>
                setDescriptions.setSupport.setPhone("UK", val)
              }
            />

            <ContactEditor
              type="tel"
              label="BELGIUM"
              value={values.support.phone.BE}
              setDescription={(val) =>
                setDescriptions.setSupport.setPhone("BE", val)
              }
            />
            <ContactEditor
              type="tel"
              label="FRANCE"
              value={values.support.phone.FR}
              setDescription={(val) =>
                setDescriptions.setSupport.setPhone("FR", val)
              }
            />
            <ContactEditor
              type="tel"
              label="SPAIN"
              value={values.support.phone.ES}
              setDescription={(val) =>
                setDescriptions.setSupport.setPhone("ES", val)
              }
            />
            <ContactEditor
              type="tel"
              label="NETHERLANDS"
              value={values.support.phone.NL}
              setDescription={(val) =>
                setDescriptions.setSupport.setPhone("NL", val)
              }
            />
          </ContactGroup>

          <ContactGroup label="Email">
            <ContactEditor
              label="USA"
              value={values.support.email.UK}
              setDescription={(val) =>
                setDescriptions.setSupport.setEmail("UK", val)
              }
            />
            <ContactEditor
              label="BELGIUM"
              value={values.support.email.BE}
              setDescription={(val) =>
                setDescriptions.setSupport.setEmail("BE", val)
              }
            />
            <ContactEditor
              label="FRANCE"
              value={values.support.email.FR}
              setDescription={(val) =>
                setDescriptions.setSupport.setEmail("FR", val)
              }
            />
            <ContactEditor
              label="SPAIN"
              value={values.support.email.ES}
              setDescription={(val) =>
                setDescriptions.setSupport.setEmail("ES", val)
              }
            />
            <ContactEditor
              label="NETHERLANDS"
              value={values.support.email.NL}
              setDescription={(val) =>
                setDescriptions.setSupport.setEmail("NL", val)
              }
            />
          </ContactGroup>

          <ContactGroup label="Address">
            <ContactEditor
              label="English"
              value={values.support.address.en}
              setDescription={setDescriptions.setSupport.setAddressEnglish}
            />
            <ContactEditor
              label="Dutch"
              value={values.support.address.nl}
              setDescription={setDescriptions.setSupport.setAddressDutch}
            />
            <ContactEditor
              label="Spanish"
              value={values.support.address.es}
              setDescription={setDescriptions.setSupport.setAddressSpanish}
            />
            <ContactEditor
              label="French"
              value={values.support.address.fr}
              setDescription={setDescriptions.setSupport.setAddressFrench}
            />
          </ContactGroup>
        </>
      )}
    </div>
  );
};

export default MultiTextEditors;
