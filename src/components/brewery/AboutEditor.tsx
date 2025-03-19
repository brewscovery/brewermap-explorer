
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAboutEditor } from './hooks/useAboutEditor';
import AboutTextArea from './components/AboutTextArea';

interface AboutEditorProps {
  breweryId: string | null;
  initialAbout: string | null;
  onUpdate?: (newAbout: string) => void;
}

const AboutEditor = ({ breweryId, initialAbout, onUpdate }: AboutEditorProps) => {
  const {
    about,
    isEditing,
    isSaving,
    charCount,
    MAX_CHARS,
    handleChange,
    startEditing,
    cancelEditing,
    saveAbout
  } = useAboutEditor({ breweryId, initialAbout, onUpdate });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">About Your Brewery</h3>
        {!isEditing && (
          <Button variant="outline" onClick={startEditing}>
            Edit
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <AboutTextArea
          value={about}
          onChange={handleChange}
          charCount={charCount}
          maxChars={MAX_CHARS}
          isSaving={isSaving}
          onCancel={cancelEditing}
          onSave={saveAbout}
        />
      ) : (
        <div className="bg-muted/50 p-4 rounded-md">
          {about ? (
            <p className="whitespace-pre-wrap">{about}</p>
          ) : (
            <p className="text-muted-foreground italic">
              No description provided. Click 'Edit' to add information about your brewery.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AboutEditor;
