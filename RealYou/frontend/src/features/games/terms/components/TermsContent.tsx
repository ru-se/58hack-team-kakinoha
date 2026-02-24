'use client';

type CheckboxKeys = 'readConfirm' | 'mailMagazine' | 'thirdPartyShare';

interface TermsContentProps {
  onCheckboxChange: (key: CheckboxKeys, checked: boolean) => void;
  onHiddenInputChange: (value: string) => void;
  checkboxStates: Record<CheckboxKeys, boolean>;
  hiddenInputValue: string;
}

export default function TermsContent({
  onCheckboxChange,
  onHiddenInputChange,
  checkboxStates,
  hiddenInputValue,
}: TermsContentProps) {
  return (
    <div className="space-y-8 pb-8 text-sm leading-relaxed text-gray-700">
      <h2 className="text-lg font-bold">サービス利用規約</h2>

      <section>
        <h3 className="mb-2 font-bold">第1条（目的）</h3>
        <p>
          本規約は、当社が提供するサービス（以下「本サービス」といいます。）の利用条件を定めるものです。
          登録ユーザーの皆さま（以下「ユーザー」といいます。）には、本規約に従って本サービスをご利用いただきます。
          本サービスの利用にあたっては、本規約のすべての条項に同意していただく必要があります。
        </p>
      </section>

      <section>
        <h3 className="mb-2 font-bold">第2条（定義）</h3>
        <p>
          本規約において使用する用語の定義は、次の各号に定めるとおりとします。
          「本サービス」とは、当社が運営するウェブサイトおよびアプリケーションを通じて提供されるすべてのサービスを意味します。
          「ユーザー」とは、本規約に同意のうえ、当社所定の方法により本サービスの利用登録を行った個人または法人を意味します。
          「コンテンツ」とは、本サービス上で閲覧可能なテキスト、画像、動画、音声その他のデータを意味します。
          「登録情報」とは、ユーザーが本サービスの利用登録時に提供する情報を意味します。
        </p>
      </section>

      <section>
        <h3 className="mb-2 font-bold">第3条（利用登録）</h3>
        <p>
          登録希望者は、当社所定の方法により利用登録を申請し、当社がこれを承認することによって、
          本サービスの利用登録が完了するものとします。当社は、以下の各号のいずれかに該当する場合、
          利用登録を拒否することがあり、その理由について一切の開示義務を負わないものとします。
          虚偽の事項を登録した場合、本規約に違反したことがある場合、その他当社が不適切と判断した場合。
          利用登録にあたり、ユーザーは正確かつ最新の情報を提供するものとし、
          登録情報に変更があった場合は速やかに更新するものとします。
        </p>
      </section>

      <section>
        <h3 className="mb-2 font-bold">
          第4条（ユーザーIDおよびパスワードの管理）
        </h3>
        <p>
          ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを管理するものとします。
          ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、
          もしくは第三者と共用することはできません。当社は、ユーザーIDとパスワードの組み合わせが
          登録情報と一致してログインされた場合には、そのユーザーIDを登録しているユーザー自身による
          利用とみなします。ユーザーIDおよびパスワードが第三者によって使用されたことによる損害は、
          当社に故意又は重大な過失がある場合を除き、当社は一切の責任を負わないものとします。
        </p>
      </section>

      {/* トラップ1: 第5条の「読みました」チェックボックス */}
      <section>
        <h3 className="mb-2 font-bold">第5条（サービス内容の変更等）</h3>
        <p>
          当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を
          中止することができるものとし、これによってユーザーに生じた損害について一切の責任を
          負いません。サービスの変更、中断、終了等について、当社は可能な限り事前に通知するよう
          努めますが、緊急の場合はこの限りではありません。
        </p>
        <label className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={checkboxStates.readConfirm}
            onChange={(e) => onCheckboxChange('readConfirm', e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-xs text-gray-500">上記の内容を読みました</span>
        </label>
      </section>

      <section>
        <h3 className="mb-2 font-bold">第6条（禁止事項）</h3>
        <p>
          ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
          法令または公序良俗に違反する行為、犯罪行為に関連する行為、
          本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為、
          当社、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、
          妨害したりする行為、本サービスによって得られた情報を商業的に利用する行為、
          当社のサービスの運営を妨害するおそれのある行為、不正アクセスをし、
          またはこれを試みる行為、他のユーザーに関する個人情報等を収集または蓄積する行為。
        </p>
      </section>

      <section>
        <h3 className="mb-2 font-bold">第7条（利用料金および支払方法）</h3>
        <p>
          ユーザーは、本サービスの有料部分の対価として、当社が別途定め、
          本ウェブサイトに表示する利用料金を、当社が指定する方法により支払うものとします。
          ユーザーが利用料金の支払を遅滞した場合には、ユーザーは年14.6%の割合による
          遅延損害金を支払うものとします。なお、当社は、ユーザーに対して事前に通知することにより、
          利用料金を変更することができるものとします。料金の変更は通知から30日後に効力を
          生じるものとし、変更後も本サービスの利用を継続した場合、ユーザーは変更後の料金に
          同意したものとみなされます。
        </p>
      </section>

      {/* トラップ2: 第8条のメルマガ・第三者提供チェックボックス（初期値ON） */}
      <section>
        <h3 className="mb-2 font-bold">第8条（個人情報の取扱い）</h3>
        <p>
          当社は、本サービスの利用によって取得する個人情報については、
          当社「プライバシーポリシー」に従い適切に取り扱うものとします。
          ユーザーの個人情報は、サービスの提供、改善、カスタマーサポート、
          および当社からの連絡に使用されます。当社は、法令に基づく場合を除き、
          ユーザーの同意なく個人情報を第三者に開示することはありません。
        </p>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checkboxStates.mailMagazine}
              onChange={(e) =>
                onCheckboxChange('mailMagazine', e.target.checked)
              }
              className="h-4 w-4"
            />
            <span className="text-xs text-gray-500">
              当社からのメールマガジンを受信する
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checkboxStates.thirdPartyShare}
              onChange={(e) =>
                onCheckboxChange('thirdPartyShare', e.target.checked)
              }
              className="h-4 w-4"
            />
            <span className="text-xs text-gray-500">
              パートナー企業への個人情報の第三者提供に同意する
            </span>
          </label>
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-bold">第9条（免責事項）</h3>
        <p>
          当社の債務不履行責任は、当社の故意または重過失によらない場合には免責されるものとします。
          当社は、何らかの理由によって責任を負う場合にも、通常生じうる損害の範囲内かつ
          有料サービスにおいては代金額を上限として損害賠償責任を負うものとします。
          当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において
          生じた取引、連絡または紛争等について一切責任を負いません。
          天災地変、戦争、テロ、暴動、法令の改正、政府機関の介入その他の不可抗力により
          本サービスの提供が困難となった場合、当社は一切の責任を負わないものとします。
        </p>
      </section>

      <section>
        <h3 className="mb-2 font-bold">第10条（サービス内容の変更等）</h3>
        <p>
          当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの
          提供を中止することができるものとし、これによってユーザーに生じた損害について一切の
          責任を負いません。本サービスの変更または中止に伴い、ユーザーが被った損害について、
          当社は直接的・間接的を問わず一切の補償を行いません。ただし、有料サービスの終了に
          際しては、未使用分の利用料金について、当社所定の方法により返金を行う場合があります。
        </p>
      </section>

      <section>
        <h3 className="mb-2 font-bold">第11条（利用規約の変更）</h3>
        <p>
          当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更する
          ことができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、
          当該ユーザーは変更後の規約に同意したものとみなします。本規約の変更は、当社ウェブサイト
          上に掲示した時点で効力を生じるものとし、ユーザーは定期的に本規約を確認する義務を負い
          ます。重要な変更については、当社は合理的な方法でユーザーに通知するよう努めます。
        </p>
      </section>

      {/* トラップ3: 第12条の隠し入力指示 */}
      <section>
        <h3 className="mb-2 font-bold">第12条（通知または連絡）</h3>
        <p>
          ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。
          当社は、ユーザーから、当社が別途定める方式に従った変更届け出がない限り、
          現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、
          これらは、発信時にユーザーへ到達したものとみなします。
        </p>
        <p className="mt-2 text-xs text-gray-400">
          本条項の確認のため、以下の入力欄に「確認済み」と入力してください。
        </p>
        <input
          type="text"
          value={hiddenInputValue}
          onChange={(e) => onHiddenInputChange(e.target.value)}
          placeholder="ここに入力"
          className="mt-1 w-48 rounded border border-gray-300 px-2 py-1 text-xs"
        />
      </section>

      <section>
        <h3 className="mb-2 font-bold">第13条（権利義務の譲渡の禁止）</h3>
        <p>
          ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく
          権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
          当社は、本サービスにかかる事業を他社に譲渡した場合には、当該事業譲渡に伴い
          利用契約上の地位、本規約に基づく権利および義務並びにユーザーの登録事項その他の
          顧客情報を当該事業譲渡の譲受人に譲渡することができるものとし、ユーザーは、
          かかる譲渡につき本項においてあらかじめ同意したものとみなします。
        </p>
      </section>

      <section>
        <h3 className="mb-2 font-bold">第14条（準拠法・裁判管轄）</h3>
        <p>
          本規約の解釈にあたっては、日本法を準拠法とします。
          本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を
          専属的合意管轄とします。本規約に定めのない事項については、民法その他の法令の
          定めるところによるものとします。
        </p>
      </section>

      <section>
        <h3 className="mb-2 font-bold">附則</h3>
        <p>本規約は2025年1月1日から施行します。</p>
      </section>
    </div>
  );
}
