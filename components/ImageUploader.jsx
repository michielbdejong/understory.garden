import React, { useEffect, useRef, useState } from 'react';

import Cropper from 'react-cropper';
import auth from 'solid-auth-client';

import { Button, Loader } from '~components/elements';
import { Module } from '~components/layout'

const ImageEditingModule = ({ src, onSave, onClose, ...props }) => {
  const [saving, setSaving] = useState()
  const cropper = useRef()
  const save = async () => {
    setSaving(true)
    await onSave(cropper.current.getCroppedCanvas())
    setSaving(false)
  }
  return (
    <Module onClose={onClose} {...props}>
      <Cropper
        ref={cropper}
        src={src}
        crossOrigin="use-credentials"
        className="h-48"
      />
      <div className="flex flex-row">
        <Button onClick={() => {
          cropper.current.rotate(90)
        }}>
          rotate
        </Button>
        {saving ? (
          <Loader />
        ) : (
            <>
              <Button onClick={save}>
                save
            </Button>
              <Button onClick={onClose}>
                cancel
            </Button>
            </>
          )}
      </div>
    </Module >
  )
}

const typesToExts = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp"
}

const extForFile = file => {
  const extFromType = typesToExts[file.type]
  if (extFromType) {
    return extFromType
  } else {
    return file.name.split(".").slice(-1)[0]
  }
}

const uploadFromCanvas = (canvas, containerUri, type) => new Promise((resolve, reject) => {
  canvas.toBlob(async (blob) => {
    const response = await auth.fetch(containerUri, {
      method: 'POST',
      force: true,
      headers: {
        'content-type': type,
        credentials: 'include'
      },
      body: blob
    });
    if (response.ok) {
      resolve(response)
    } else {
      reject(response)
      console.log("image upload failed: ", response)
    }
  }, type, 1)

})


export function ImageEditor({ element, onClose, onSave, ...props }) {

  const { url, originalUrl, mime } = element
  return (
    <ImageEditingModule src={originalUrl || url}
      onClose={onClose}
      onSave={async (canvas) => {
        await uploadFromCanvas(canvas, url, mime)
        onSave(url)
      }} {...props} />
  )
}

export default ({ onClose, onUpload, uploadDirectory, ...props }) => {
  const inputRef = useRef()
  const [file, setFile] = useState()
  const [originalSrc, setOriginalSrc] = useState()
  const [previewSrc, setPreviewSrc] = useState()
  const [croppedCanvas, setCroppedCanvas] = useState()
  const [editing, setEditing] = useState(false)

  const insert = async () => {
    const response = await uploadFromCanvas(croppedCanvas, uploadDirectory, file.type)
    onUpload && onUpload(response, file.type)
    onClose && onClose()
  }

  useEffect(() => {
    let newSrc;
    if (file) {
      newSrc = URL.createObjectURL(file)
      setOriginalSrc(newSrc)
      setPreviewSrc(newSrc)
      setEditing(true)
    }
    return () => {
      if (newSrc) {
        URL.revokeObjectURL(newSrc)
      }
    }
  }, [file])

  const onFileChanged = event => {
    if (event.target.files) {
      const file = event.target.files[0]
      setFile(file)
    }
  }

  return (
    <>
      {
        editing ? (
          <ImageEditingModule open={editing} src={originalSrc}
            onClose={onClose}
            onSave={async (canvas) => {
              setPreviewSrc(canvas.toDataURL(file.type))
              setCroppedCanvas(canvas)
              setEditing(false)
            }} />

        ) : (
            <Module {...props}>
              {previewSrc && (
                <img src={previewSrc} className="h-32 object-contain" alt="your new profile" />
              )}
              <div className="flex flex-row">
                <Button onClick={() => inputRef.current.click()}>
                  pick a file
                </Button>
                {croppedCanvas &&
                  <>
                    <Button onClick={() => setEditing(true)}>
                      edit
                   </Button>
                    <Button onClick={insert}>
                      upload
                   </Button>
                  </>
                }
                <Button onClick={() => onClose && onClose()}>
                  cancel
                </Button>
              </div>
              <input
                ref={inputRef}
                accept="image/*"
                style={{ display: 'none' }}
                type="file"
                onChange={onFileChanged}
              />
            </Module>
          )
      }
    </>
  )
}
